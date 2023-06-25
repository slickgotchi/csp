import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import GameRoom from "../../../rooms/Game";
import * as Collisions from 'detect-collisions';
import { Collider, ColliderShape } from "../../components/collisions/Collider";
import { Transform } from "../../components/Transform";
import { ASC_Enemy } from "../../components/gas/ability-system-components/ASC_Enemy";
import { ASC_Player } from "../../components/gas/ability-system-components/ASC_Player";

interface IPosition {
    x: number;
    y: number;
    serverTime_ms: number;
}

export class ArcCircleCollider extends Collisions.Circle {
    serverEid: number = 0;
    positionBuffer: IPosition[] = [];
}

export class ArcBoxCollider extends Collisions.Box {
    serverEid: number = 0;
    positionBuffer: IPosition[] = [];
}

const POSITION_BUFFER_SIZE = 30;

export const collidersByEid = new Map<number, ArcCircleCollider | ArcBoxCollider>();

export const createColliderSystem = (room: GameRoom, world: IWorld, system: Collisions.System) => {
    const onUpdate = defineQuery([Collider]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    return defineSystem((world: IWorld) => {
        onAdd(world).forEach(eid => {
            switch (Collider.shape[eid]) {
                case ColliderShape.Circle: {
                    const circ = system.createCircle(
                        {x: Transform.x[eid], y: Transform.y[eid]},
                        Collider.radius[eid]
                    ) as ArcCircleCollider;
                    circ.isStatic = Collider.isStatic[eid] === 1;
                    circ.isTrigger = Collider.isTrigger[eid] === 1;
                    circ.serverEid = eid;
                    circ.positionBuffer = [];
                    collidersByEid.set(eid, circ);
                    break;
                }
                case ColliderShape.Box: {
                    const box = system.createBox(
                        {x: Transform.x[eid], y: Transform.y[eid]},
                        Collider.width[eid],
                        Collider.height[eid]
                    ) as ArcBoxCollider;
                    box.isStatic = Collider.isStatic[eid] === 1;
                    box.isTrigger = Collider.isTrigger[eid] === 1;
                    box.serverEid = eid;
                    box.positionBuffer = [];
                    collidersByEid.set(eid, box);
                    break;
                }
                default: break;
            }
        });

        onUpdate(world).forEach(eid => {
            const collider = collidersByEid.get(eid);
            if (collider && collider.positionBuffer) {
                // update position
                collider.setPosition(Transform.x[eid], Transform.y[eid]);

                // separate if required
                if (Collider.isAutoStaticSeparate[eid]) {
                    separateFromStaticColliders(eid, collider);
                }

                // update position buffer
                collider.positionBuffer.push({
                    x: collider.x,
                    y: collider.y,
                    serverTime_ms: room.state.serverTime_ms
                });
                if (collider.positionBuffer.length > POSITION_BUFFER_SIZE) {
                    collider.positionBuffer.shift();
                }
            }
            
        })

        return world;
    });
}

export const separateFromStaticColliders = (eid: number, body: Collisions.Circle | Collisions.Box | undefined) => {
    if (!body) return;
    const system = body.system;
    if (!system) return;

    body.setPosition(Transform.x[eid], Transform.y[eid]);
    system.checkOne(body, (response: Collisions.Response) => {
        const { overlapV, b } = response;
        if (b.isStatic) {
            body.setPosition(body.x - overlapV.x, body.y - overlapV.y);
            Transform.x[eid] = body.x;
            Transform.y[eid] = body.y;
        }
    });
}

export const rollbackCollider = (eid: number, targetTime_ms: number,) => {
    const collider = collidersByEid.get(eid);
    if (collider) {
        let i = 0;
        let found = 0;
        while (i < collider.positionBuffer.length) {
            if (collider.positionBuffer[i].serverTime_ms > targetTime_ms) {
                found = i;
                break;
            } else {
                i++;
            }
        }
        collider.setPosition(collider.positionBuffer[found].x, collider.positionBuffer[found].y);
    }
}

export const unRollbackCollider = (eid: number) => {
    const collider = collidersByEid.get(eid);
    if (collider) {
        const last_i = collider.positionBuffer.length - 1;
        collider.setPosition(
            collider.positionBuffer[last_i].x, 
            collider.positionBuffer[last_i].y
        );
    }
}

const onEnemies = defineQuery([ASC_Enemy]);
const onPlayers = defineQuery([ASC_Player]);

export const rollbackColliders = (world: IWorld, targetTime_ms: number) => {
    onEnemies(world).forEach(eid => {
        rollbackCollider(eid, targetTime_ms);
    });

    onPlayers(world).forEach(eid => {
        rollbackCollider(eid, targetTime_ms);
    })
}

export const unRollbackColliders = (world: IWorld) => {
    onEnemies(world).forEach(eid => {
        unRollbackCollider(eid);
    });

    onPlayers(world).forEach(eid => {
        unRollbackCollider(eid);
    })
}