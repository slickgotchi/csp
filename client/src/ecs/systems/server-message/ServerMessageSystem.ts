import { IWorld, defineSystem } from "bitecs"
import { Room } from "colyseus.js";
import { sGameObject } from "../../../../../server/src/types/sGameObject";
import { serverMessageRoutes } from "./routes";

import { Message } from '../../../../../server/src/types/Messages';

export interface IMessage {
    name: string;
    payload: any;
    recv_ms: number;
}

export const messages: IMessage[] = [];

export const createServerMessageSystem = (room: Room, scene: Phaser.Scene) => {

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

    room.onMessage(Message.Player.Dash, payload => {
        messages.push({
            name: 'player-dash',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    room.onMessage(Message.Player.MeleeAttack, payload => {
        messages.push({
            name: 'player-melee-attack',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    room.onMessage(Message.Player.RangedAttack, payload => {
        messages.push({
            name: 'player-ranged-attack',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    room.onMessage(Message.Enemy.TakeDamage, payload => {
        messages.push({
            name: 'enemy-take-damage',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    room.onMessage('positions', positions => {
        positions.forEach((pos: any) => {
            const circ = scene.add.circle(
                pos.x,
                pos.y,
                40,
                0x444444,
            )
            setTimeout(() => {
                circ.destroy()
            }, 2000)
        })
    })


    // SERVER MESSAGE PROCESSING
    return defineSystem((world: IWorld) => {
        const now = Date.now();
        for (let i = 0; i < messages.length; i++) {
            // save current message for convenience
            const message = messages[i];
            if (message.recv_ms <= now) {
                // grab and run handler for that message
                const handler = (serverMessageRoutes as any)[message.name];
                handler(message, room, world, scene);

                // remove the message
                messages.splice(i,1);
            }
        }

        return world;
    })
}







