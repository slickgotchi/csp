import { Client } from "colyseus";
import GameRoom from "../rooms/Game";
import { sPlayer } from "../types/sPlayer";


export enum PlayerState {
    Moving,
    MeleeAttack,
    RangedAttack,
    Dash
}

export enum InputType {
    Idol,
    Move,
    Dash,
    MeleeAttack,
    RangedAttack,
}

export interface IInput {
    type: InputType,
    move: {
        dx: number,
        dy: number,
    },
    key_release: {
        l: boolean,
        j: boolean
    },
    dt_ms: number,
    id: number,
}

export interface IMessage {
    name: string;
    payload: IInput;
    recv_ms: number;
}

// export const messages: IMessage[] = [];

export const setupMessages = (room: GameRoom) => {
    room.onMessage('client-input', (client: Client, input: IInput) => {
        // find matching player
        room.state.gameObjects.forEach(go => {
            if (go.type === 'player' && (go as sPlayer).sessionId === client.sessionId) {
                (go as sPlayer).messages.push({
                    name: 'client-input',
                    payload: input,
                    recv_ms: Date.now()
                });
            }
        })
        // messages.push({
        //     name: 'client-input',
        //     payload: input,
        //     recv_ms: Date.now()
        // });
    });

    room.onMessage('ping-server', (client: Client, client_time_ms: number) => {
        client.send('server-ping', client_time_ms);
    })
}