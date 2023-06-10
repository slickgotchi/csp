import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { Room } from "colyseus.js";
import { Schema, MapSchema } from "@colyseus/schema";
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
import { createPfEnemy } from "../prefabs/pfEnemy";
import { sEnemy } from "../../../../server/src/types/sEnemy";
import { saveBuffer } from "./InterpolateSystem";

export interface IMessage {
    name: string;
    gameObjects: MapSchema<sGameObject, string>,
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

    const onUpdate = defineQuery([ServerMessage]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    room.onMessage('server-update', () => {
        onUpdate(world).forEach(eid => {
            const messages = messagesByEid.get(eid);
            if (messages) {
                messages.push({
                    name: 'server-update',
                    gameObjects: room.state.gameObjects,
                    recv_ms: Date.now()
                });
            }
        })
    });
    
    room.state.gameObjects.onAdd((go: sGameObject, key: string) => {
        switch(go.type) {
            case 'player': {
                createPfPlayerShadow({
                    world: world,
                    serverEid: go.serverEid,
                    x: go.x,
                    y: go.y,
                });
        
                createPfPlayer({
                    world: world,
                    serverEid: go.serverEid,
                    x: go.x,
                    y: go.y,
                });

                break;
            }
            case 'rectangle': {
                scene.add.rectangle(
                    go.x,
                    go.y,
                    (go as sRectangle).width,
                    (go as sRectangle).height,
                    0x666666)
                        .setOrigin(0,0);
                collisionSystem.createBox(
                    {x: go.x, y: go.y},
                    (go as sRectangle).width,
                    (go as sRectangle).height
                )
                break;
            }
            case 'enemy': {
                createPfEnemy({
                    world: world,
                    serverEid: go.serverEid,
                    x: go.x,
                    y: go.y,
                })
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
            if (!messages || messages.length === 0) return;

            // go through messages
            const now = Date.now();
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                if (message.recv_ms <= now) {
                    messages.splice(i,1);

                    const go = message.gameObjects.get(ServerMessage.serverEid[eid].toString()) as sGameObject;

                    switch (go.type) {
                        case 'player': {
                            // update transform with authrative state
                            Transform.x[eid] = go.x;
                            Transform.y[eid] = go.y;

                            // if server recon do recon
                            if (ServerMessage.isServerReconciliation[eid]) {
                                let j = 0;
                                while (j < pending_inputs.length) {
                                    const input = pending_inputs[j];
                                    if (input.id <= (go as sPlayer).last_processed_input) {
                                        pending_inputs.splice(j,1);
                                    } else {
                                        applyInput(eid, input);
                                        resolveCollisions(eid);
                                        j++;
                                    }
                                }
                            }
                            break;
                        }
                        case 'enemy': {
                            Transform.x[eid] = go.x;
                            Transform.y[eid] = go.y;
                            saveBuffer(eid);
                            break;
                        }
                        default: break;
                    }
                    
                }
            }

        });

        return world;
    })
}