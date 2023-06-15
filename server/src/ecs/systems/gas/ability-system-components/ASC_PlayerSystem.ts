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
import { Client } from "colyseus";
import { IInput, IInputMessage } from "../../../../types/Input";
import { sPlayer } from "../../../../types/sPlayer";
import { sGameObject } from "../../../../types/sGameObject";
import { Transform } from "../../../components/Transform";
import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { tryActivateGA_Dash } from "../gameplay-abilities/GA_DashSystem";

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
                        message = validateInputMessage(message);
        
                        // apply input
                        applyInput(world, playerGo.serverEid, playerGo, message.input);
                    }
                }
            }   
        });

        return world;
    });
}

// use router to find correct ability to activate
const applyInput = (world: IWorld, eid: number, gameObject: sGameObject, input: IInput) => {
    const handler = (tryActivateGA_Routes as any)[input.tryActivateGA];
    handler(world, eid, input);

    (gameObject as sPlayer).last_processed_input = input.id;
}

// abilities
const tryActivateGA_Idol = (world: IWorld, eid: number, input: IInput) => {
    
}

const tryActivateGA_Move = (world: IWorld, eid: number, input: IInput) => {
    Transform.x[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
    Transform.y[eid] += 400 * input.move.dy * input.dt_ms * 0.001;
}

const tryActivateGA_DashRoute = (world: IWorld, eid: number, input: IInput) => {
    tryActivateGA_Dash(eid, input.move.dx, input.move.dy, 500);
}

const tryActivateGA_MeleeAttack = (world: IWorld, eid: number, input: IInput) => {
    Transform.x[eid] += input.move.dx * 100;
    Transform.y[eid] += input.move.dy * 100;
}

const tryActivateGA_RangedAttack = (world: IWorld, eid: number, input: IInput) => {
    
}

const tryActivateGA_Wait = (world: IWorld, eid: number, input: IInput) => {
    
}

export const tryActivateGA_Routes = {
    "GA_Idol": tryActivateGA_Idol,
    'GA_Movement': tryActivateGA_Move,
    "GA_Dash": tryActivateGA_DashRoute,
    "GA_MeleeAttack": tryActivateGA_MeleeAttack,
    "GA_RangedAttack": tryActivateGA_RangedAttack,
    "GA_Wait": tryActivateGA_Wait,
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