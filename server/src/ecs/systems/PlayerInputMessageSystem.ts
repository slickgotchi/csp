import { IWorld, defineQuery, defineSystem } from "bitecs";
import GameRoom from "../../rooms/Game";
import { ASC_Player } from "../components/gas/ability-system-components/ASC_Player";
import { sPlayer } from "../../types/sPlayer";
import { sGameObject } from "../../types/sGameObject";
import { IInput, IInputMessage, InputType } from "../../messages/Messages";
import { Client } from "colyseus";
import { Transform } from "../components/Transform";


export const createPlayerInputMessageSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([ASC_Player]);

    return defineSystem((world: IWorld) => {

        const now = Date.now();

        onUpdate(world).forEach(eid => {
            const playerGo = room.state.gameObjects.get(eid.toString()) as sPlayer;
            if (playerGo) {
                for (let i = 0; i < playerGo.inputMessages.length; i++) {
                    let message = playerGo.inputMessages[i];
                    if (message.recv_ms <= now) {
                        playerGo.inputMessages.splice(i,1);
        
                        // validate our message
                        message = validateInputMessage(message);
        
                        // apply input
                        const input: IInput = message.payload;
                        applyInput(world, playerGo.serverEid, playerGo, input);
                        playerGo.last_processed_input = input.id;
                    }
                }
            }       
        });

        return world;
    })
}

const applyInput = (world: IWorld, eid: number, gameObject: sGameObject, input: IInput) => {
    // if InputType.Move => 
    // tryActivateAbility(GA_Move)
    // const str = getInputTypeAbilityRouteString(input.type);
    // const handler = (tryActivateGameplayAbilityRoutes as any)[str];
    // handler(world, eid, input);

    // apply input depending on state
    switch(input.type) {
        case InputType.Move: {
            // gameObject.x += 400 * input.move.dx * input.dt_ms * 0.001;
            // gameObject.y += 400 * input.move.dy * input.dt_ms * 0.001;
            Transform.x[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
            Transform.y[eid] += 400 * input.move.dy * input.dt_ms * 0.001;
            break;
        }
        case InputType.Dash: {
            Transform.x[eid] += input.move.dx * 500;
            Transform.y[eid] += input.move.dy * 500;
            break;
        }
        case InputType.MeleeAttack: {
            Transform.x[eid] += input.move.dx * 100;
            Transform.y[eid] += input.move.dy * 100;
            break;
        }
        case InputType.RangedAttack: {

            break;
        }
        default: break;
    }
}

// const tryActivateGA_Move = (world: IWorld, input: IInput, eid: number) => {
//     addComponent(world, AT_Move, eid);
//     AT_Move.dx[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
//     AT_Move.dy[eid] += 400 * input.move.dy * input.dt_ms * 0.001;
// }

// const tryActivateGameplayAbilityRoutes = {
//     'ga-move': tryActivateGA_Move 
// }


const recvMsBuffersByClient = new Map<Client,number[]>();
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
        inputMessage.payload.dt_ms = av_delta_ms;
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