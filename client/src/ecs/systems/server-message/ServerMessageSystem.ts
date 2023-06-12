import { IWorld, defineSystem } from "bitecs"
import { Room } from "colyseus.js";
import { sGameObject } from "../../../../../server/src/types/sGameObject";
import { serverMessageRoutes } from "./routes";

export interface IMessage {
    name: string;
    payload: any;
    recv_ms: number;
}

export const messages: IMessage[] = [];

export const createServerMessageSystem = (room: Room) => {

    // SERVER MESSAGE RECEIVED PROCESSING
    room.onMessage('server-update', () => {
        messages.push({
            name: 'server-update',
            payload: null,
            recv_ms: Date.now()
        });
    });
    
    room.state.gameObjects.onAdd((go: sGameObject, key: string) => {
        messages.push({
            name: 'add-game-object',
            payload: go,
            recv_ms: Date.now()
        });
    });

    // SERVER MESSAGE PROCESSING
    return defineSystem((world: IWorld) => {
        const now = Date.now();
        for (let i = 0; i < messages.length; i++) {
            // save current message for convenience
            const message = messages[i];
            if (message.recv_ms <= now) {
                // grab and run handler for that message
                const handler = (serverMessageRoutes as any)[message.name];
                handler(message, room, world);

                // remove the message
                messages.splice(i,1);
            }
        }

        return world;
    })
}






