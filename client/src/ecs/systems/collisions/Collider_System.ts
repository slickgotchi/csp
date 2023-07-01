import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import * as Collisions from 'detect-collisions';
import { GameScene } from "../../../internalExports";
import { ColliderShape, Collider_Component } from "../../componets/collisions/Collider_Component";
import { Transform_Component } from "../../componets/core/Transform_Component";

export class ArcCircleCollider extends Collisions.Circle {
    eid: number = 0;
}

export class ArcBoxCollider extends Collisions.Box {
    eid: number = 0;
}

export const collidersByEid = new Map<number, ArcCircleCollider | ArcBoxCollider>();

export const createCollider_System = (gScene: GameScene) => {
    const onUpdate = defineQuery([Collider_Component]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    return defineSystem((world: IWorld) => {
        onAdd(world).forEach(eid => {
            switch (Collider_Component.shape[eid]) {
                case ColliderShape.Circle: {
                    const circ = gScene.collisions.createCircle(
                        {x: Transform_Component.x[eid], y: Transform_Component.y[eid]},
                        Collider_Component.radius[eid]
                    ) as ArcCircleCollider;
                    circ.isStatic = Collider_Component.isStatic[eid] === 1;
                    circ.isTrigger = Collider_Component.isTrigger[eid] === 1;
                    circ.eid = eid;
                    collidersByEid.set(eid, circ);
                    break;
                }
                case ColliderShape.Box: {
                    const box = gScene.collisions.createBox(
                        {x: Transform_Component.x[eid], y: Transform_Component.y[eid]},
                        Collider_Component.width[eid],
                        Collider_Component.height[eid]
                    ) as ArcBoxCollider;
                    box.isStatic = Collider_Component.isStatic[eid] === 1;
                    box.isTrigger = Collider_Component.isTrigger[eid] === 1;
                    box.eid = eid;
                    collidersByEid.set(eid, box);
                    break;
                }
                default: break;
            }
        });

        onUpdate(world).forEach(eid => {
            const collider = collidersByEid.get(eid);
            if (collider) {
                // update position
                collider.setPosition(Transform_Component.x[eid], Transform_Component.y[eid]);
            }
            
        })

        return world;
    });
}

export const separateFromStaticColliders = (eid: number, body: Collisions.Circle | Collisions.Box | undefined) => {
    if (!body) return;
    const system = body.system;
    if (!system) return;

    body.setPosition(Transform_Component.x[eid], Transform_Component.y[eid]);
    system.checkOne(body, (response: Collisions.Response) => {
        const { overlapV, b } = response;
        if (b.isStatic) {
            body.setPosition(body.x - overlapV.x, body.y - overlapV.y);
            Transform_Component.x[eid] = body.x;
            Transform_Component.y[eid] = body.y;
        }
    });
}