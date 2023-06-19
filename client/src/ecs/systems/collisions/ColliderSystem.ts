import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import * as Collisions from 'detect-collisions';
import { Collider, ColliderShape } from "../../componets/collisions/Collider";
import { Transform } from "../../componets/Transform";
import { ClientPlayerInput } from "../../componets/ClientPlayerInput";

interface IPosition {
    x: number;
    y: number;
    serverTime_ms: number;
}

export class ArcCircleCollider extends Collisions.Circle {
    eid: number = 0;
}

export class ArcBoxCollider extends Collisions.Box {
    eid: number = 0;
}

export const collidersByEid = new Map<number, ArcCircleCollider | ArcBoxCollider>();

export const createColliderSystem = (world: IWorld, system: Collisions.System) => {
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
                    circ.eid = eid;
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
                collider.setPosition(Transform.x[eid], Transform.y[eid]);
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