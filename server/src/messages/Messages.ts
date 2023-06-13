import { Client } from "colyseus";
import GameRoom from "../rooms/Game";
import { sPlayer } from "../types/sPlayer";

// export enum InputType {
//     Idol,
//     Move,
//     Dash,
//     MeleeAttack,
//     RangedAttack,
// }

// export interface IInput {
//     type: InputType,
//     move: {
//         dx: number,
//         dy: number,
//     },
//     key_release: {
//         l: boolean,
//         j: boolean
//     },
//     dt_ms: number,
//     id: number,
// }

// export interface IInputMessage {
//     client: Client;
//     name: string;
//     input: IInput;
//     recv_ms: number;
// }

// export const setupMessages = (room: GameRoom) => {
//     // room.onMessage('client-input', (client: Client, input: IInput) => {
//     //     // find matching player
//     //     room.state.gameObjects.forEach(go => {
//     //         if (go.type === 'player' && (go as sPlayer).sessionId === client.sessionId) {
//     //             (go as sPlayer).inputMessages.push({
//     //                 name: 'client-input',
//     //                 client: client,
//     //                 payload: input,
//     //                 recv_ms: Date.now()
//     //             });
//     //         }
//     //     });
//     // });

    
// }