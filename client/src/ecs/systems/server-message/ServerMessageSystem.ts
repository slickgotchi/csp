import { IWorld, defineSystem } from "bitecs"
import { Room } from "colyseus.js";
import { sGameObject } from "../../../../../server/src/types/sGameObject";
import { serverMessageRoutes } from "./routes";

import { Message } from '../../../../../server/src/types/Messages';
import { GameScene } from "../../../scenes/GameScene";

export interface IMessage {
    name: string;
    payload: any;
    recv_ms: number;
}

export const messages: IMessage[] = [];

export const createServerMessageSystem = (gScene: GameScene) => {

    // SERVER MESSAGE RECEIVED PROCESSING
    gScene.room.onMessage('server-update', () => {
        messages.push({
            name: 'server-update',
            payload: null,
            recv_ms: Date.now()
        });
    });
    
    gScene.room.state.gameObjects.onAdd((go: sGameObject, key: string) => {
        messages.push({
            name: 'add-game-object',
            payload: go,
            recv_ms: Date.now()
        });
    });

    gScene.room.onMessage(Message.Player.Move, payload => {
        messages.push({
            name: 'player-move',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    gScene.room.onMessage(Message.Player.Dash, payload => {
        messages.push({
            name: 'player-dash',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    gScene.room.onMessage(Message.Player.MeleeAttack, payload => {
        messages.push({
            name: 'player-melee-attack',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    gScene.room.onMessage(Message.Player.RangedAttack, payload => {
        messages.push({
            name: 'player-ranged-attack',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    gScene.room.onMessage(Message.Player.PortalMageAxe, payload => {
        messages.push({
            name: 'player-portal-mage-axe',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    gScene.room.onMessage(Message.Enemy.TakeDamage, payload => {
        messages.push({
            name: 'enemy-take-damage',
            payload: payload,
            recv_ms: Date.now()
        })
    });

    gScene.room.onMessage('positions', positions => {
        positions.forEach((pos: any) => {
            const circ = gScene.add.circle(
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

    gScene.room.onMessage('hit-box', hitCollider => {
        const rect = gScene.add.rectangle(
            hitCollider.x,
            hitCollider.y,
            hitCollider.width,
            hitCollider.height,
            0xffffff
        )
        rect.setAlpha(0.5);
        rect.setRotation(hitCollider.rot);
    
        setTimeout(() => {
            rect.destroy()
        }, 2000)
    })

    gScene.room.onMessage('bbox', bbox => {
        const rect = gScene.add.rectangle(
            bbox.minX,
            bbox.minY,
            bbox.maxX - bbox.minX,
            bbox.maxY - bbox.minY,
            0x6666ff
        )
        rect.setAlpha(0.3);
        rect.setOrigin(0,0);
    
        setTimeout(() => {
            rect.destroy()
        }, 2000)
    })

    gScene.room.onMessage('ping-client', server_time_ms => {
        gScene.room.send('client-ping', server_time_ms);
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
                handler(message, gScene.room, world, gScene);

                // remove the message
                messages.splice(i,1);
            }
        }

        return world;
    })
}







