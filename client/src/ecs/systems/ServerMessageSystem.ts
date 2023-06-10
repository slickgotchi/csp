import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { Room } from "colyseus.js";
import { Schema, ArraySchema } from "@colyseus/schema";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";
import { IInput, applyInput, pending_inputs, resolveCollisions } from "./ClientPlayerInputSystem";
import { ServerMessage } from "../componets/ServerMessage";
import { IGameState } from "../../../../server/src/types/IGameState";
import { sGameObject } from "../../../../server/src/types/sGameObject";
import { sRectangle } from "../../../../server/src/types/sRectangle";
import { sPlayer } from "../../../../server/src/types/sPlayer";
import { createPfPlayer } from "../prefabs/pfPlayer";
import { createPfPlayerShadow } from "../prefabs/pfPlayerShadow";
import * as Collisions from 'detect-collisions';

export interface IMessage {
    name: string;
    payload: {
        gameObject: any;
        last_processed_input: number;
    }
    recv_ms: number;
}

// const messages: any[] = [];
const messagesByEid = new Map<number, IMessage[]>();

export const createServerMessageSystem = (
    room: Room<IGameState & Schema>, 
    world: IWorld, 
    scene: Phaser.Scene,
    collisionSystem: Collisions.System
    ) => {

    const onUpdate = defineQuery([Player]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    room.onMessage('server-update', payload => {
        onUpdate(world).forEach(eid => {
            const messages = messagesByEid.get(eid);
            if (messages) {
                messages.push({
                    name: 'server-update',
                    payload: payload,
                    recv_ms: Date.now()
                });
            }
        })
    });
    
    room.state.gameObjects.onAdd((go: sGameObject, key: number) => {
        switch(go.type) {
            case 'player': {
                createPfPlayerShadow({
                    world: world,
                    x: 1000,
                    y: 500,
                });
        
                createPfPlayer({
                    world: world,
                    x: 1000,
                    y: 500,
                });

                break;
            }
            case 'rectangle': {
                scene.add.rectangle(
                    go.position.x,
                    go.position.y,
                    (go as sRectangle).width,
                    (go as sRectangle).height,
                    0xff6666)
                        .setOrigin(0,0);
                collisionSystem.createBox(
                    {x: go.position.x, y: go.position.y},
                    (go as sRectangle).width,
                    (go as sRectangle).height
                )
                break;
            }
            default: break;
        }
    });

    return defineSystem((world: IWorld) => {
        onAdd(world).forEach(eid => {
            messagesByEid.set(eid, []);
        });

        onUpdate(world).forEach(eid => {
            // check for messages
            const messages = messagesByEid.get(eid);
            if (!messages) return;

            // go through messages
            const now = Date.now();
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                if (message.recv_ms <= now) {
                    messages.splice(i,1);

                    // do updates
                    Transform.x[eid] = message.payload.gameObject.position.x;
                    Transform.y[eid] = message.payload.gameObject.position.y;
                    
                    if (ServerMessage.isServerReconciliation[eid]) {
                        // do server reconciliation
                        var j = 0;
                        while (j < pending_inputs.length) {
                            const input = pending_inputs[j];
                            if (input.id <= message.payload.last_processed_input) {
                                pending_inputs.splice(j,1);
                            } else {
                                applyInput(eid, input);
                                resolveCollisions(eid);
                                j++;
                            }
                        }
                    }
                }
            }

        });

        return world;
    })
}