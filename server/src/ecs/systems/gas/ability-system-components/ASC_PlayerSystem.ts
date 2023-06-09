/*
The Ability System Component is the main interface through which your 
game's characters will access the Gameplay Ability System. This 
Component manages Gameplay Attributes, runs Gameplay Events, stores 
Gameplay Abilities, and even handles binding player input to Gameplay 
Ability activation, confirmation, and cancelation commands. Any Actor 
that is intended to interact with the Gameplay Ability System should 
have an Ability System Component.
https://docs.unrealengine.com/4.26/en-US/InteractiveExperiences/GameplayAbilitySystem/
*/

import { IWorld, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { ASC_Player } from "../../../components/gas/ability-system-components/ASC_Player";
import { Client, Room } from "colyseus";
import { IInput, IInputMessage } from "../../../../types/Input";
import { sPlayer } from "../../../../types/sPlayer";
import { sGameObject } from "../../../../types/sGameObject";
import { Transform } from "../../../components/Transform";
import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { tryActivateGA_Dash } from "../gameplay-abilities/GA_DashSystem";
import { tryActivateGA_Move } from "../gameplay-abilities/GA_MoveSystem";
import { tryActivateGA_MeleeAttack } from "../gameplay-abilities/GA_MeleeAttackSystem";
import { tryActivateGA_RangedAttack } from "../gameplay-abilities/GA_RangedAttackSystem";
import { tryActivateGA_Null } from "../gameplay-abilities/GA_NullSystem";
import { tryActivateGA_PortalMageAxe } from "../gameplay-abilities/GA_PortalMageAxeSystem";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { tryActivateGA_MoveSpecial } from "../gameplay-abilities/GA_MoveSpecialSystem";

export const createASC_PlayerSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([ASC_Player]);

    // define the input message receiver
    room.onMessage('client-input', (client: Client, input: IInput) => {
        // find matching player
        room.state.gameObjects.forEach(go => {
            if (go.type === 'player' && (go as sPlayer).sessionId === client.sessionId) {
                (go as sPlayer).inputMessages.push({
                    name: 'client-input',
                    client: client,
                    input: input,
                    recv_ms: Date.now()
                });
            }
        });
    });

    return defineSystem((world: IWorld) => {const now = Date.now();

        onUpdate(world).forEach(eid => {
            const playerGo = room.state.gameObjects.get(eid.toString()) as sPlayer;
            if (playerGo) {
                for (let i = 0; i < playerGo.inputMessages.length; i++) {
                    let message = playerGo.inputMessages[i];
                    if (message.recv_ms <= now) {
                        // remove input mesaasage from queue
                        playerGo.inputMessages.splice(i,1);
        
                        // validate our message
                        // message = validateInputMessage(message);
        
                        // apply input
                        applyInput(playerGo.serverEid, playerGo, message.input);
                    }
                }
            }   
        });

        return world;
    });
}

// use router to find correct ability to activate
const applyInput = (eid: number, gameObject: sGameObject, input: IInput) => {
    const handler = (tryActivateGA_Routes as any)[input.targetGA];
    handler(eid, input);

    (gameObject as sPlayer).last_processed_input = input.id;
    (gameObject as sPlayer).accum_ms = 0;
}

export const tryActivateGA_Routes = {
    "GA_Null": tryActivateGA_Null,
    'GA_Move': tryActivateGA_Move,
    "GA_Dash": tryActivateGA_Dash,
    "GA_MeleeAttack": tryActivateGA_MeleeAttack,
    "GA_RangedAttack": tryActivateGA_RangedAttack,
    "GA_PortalMageAxe": tryActivateGA_PortalMageAxe,
    "GA_MoveSpecial": tryActivateGA_MoveSpecial
}

export const recvMsBuffersByClient = new Map<Client,number[]>();
const BUFFER_SIZE = 50;

const validateInputMessage = (inputMessage: IInputMessage) => {
    const recv_ms_buffer = recvMsBuffersByClient.get(inputMessage.client);
    if (!recv_ms_buffer) {
        recvMsBuffersByClient.set(inputMessage.client, []);
        return inputMessage;
    }

    // store receive times in buffer
    recv_ms_buffer.push(inputMessage.recv_ms);
    if (recv_ms_buffer.length > BUFFER_SIZE) {
        recv_ms_buffer.splice(0,1);
    }

    // if 10 entries we can calc average delta
    if (recv_ms_buffer.length >= 10) {
        const av_delta_ms = averageDelta(recv_ms_buffer);
        inputMessage.input.dt_ms = av_delta_ms;
        return inputMessage;
    } else {
        return inputMessage;
    }

}

const averageDelta = (arr: number[]) => {
    let deltaSum = 0;
    for (let i = 0; i < arr.length-2; i++) {
        deltaSum += arr[i+1] - arr[i];
    }
    return deltaSum / (arr.length-1);
}