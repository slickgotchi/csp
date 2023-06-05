import { Client } from "colyseus";
import GameRoom from "../rooms/Game";

export const messages: any[] = [];

interface IInput {
    move: {
        dx: number,
        dy: number,
    },
    dt_ms: number,
    id: number,
}

export const setupMessages = (room: GameRoom) => {

    room.onMessage('client-input', (client: Client, msg: IInput) => {
        messages.push({
            name: 'client-input',
            payload: msg,
            recv_ms: Date.now()
        });
    });
}