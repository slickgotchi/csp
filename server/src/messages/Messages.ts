import { Client } from "colyseus";
import GameRoom from "../rooms/Game";


export interface IInput {
    move: {
        dx: number,
        dy: number,
    },
    key_release: {
        l: boolean,
    },
    dt_ms: number,
    id: number,
}

export interface IMessage {
    name: string;
    payload: IInput;
    recv_ms: number;
}

export const messages: IMessage[] = [];

export const setupMessages = (room: GameRoom) => {
    room.onMessage('client-input', (client: Client, input: IInput) => {
        messages.push({
            name: 'client-input',
            payload: input,
            recv_ms: Date.now()
        });
    });

    room.onMessage('ping-server', (client: Client, client_time_ms: number) => {
        client.send('server-ping', client_time_ms);
    })
}