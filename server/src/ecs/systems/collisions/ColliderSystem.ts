import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import GameRoom from "../../../rooms/Game";
import * as Collisions from 'detect-collisions';
import { Collider, ColliderShape } from "../../components/collisions/Collider";
import { Transform } from "../../components/Transform";

export const collidersByEid = new Map<number, Collisions.Circle | Collisions.Box>();


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
                    );
                    circ.isStatic = Collider.isStatic[eid] === 1;
                    circ.isTrigger = Collider.isTrigger[eid] === 1;
                    collidersByEid.set(eid, circ);
                    break;
                }
                case ColliderShape.Box: {
                    const box = system.createBox(
                        {x: Transform.x[eid], y: Transform.y[eid]},
                        Collider.width[eid],
                        Collider.height[eid]
                    );
                    box.isStatic = Collider.isStatic[eid] === 1;
                    box.isTrigger = Collider.isTrigger[eid] === 1;
                    collidersByEid.set(eid, box);
                    break;
                }
                default: break;
            }
        });

        onUpdate(world).forEach(eid => {
            switch (Collider.shape[eid]) {
                case ColliderShape.Circle: {
                    const circ = collidersByEid.get(eid);
                    if (circ) {
                        circ.setPosition(Transform.x[eid], Transform.y[eid]);

                        if (Collider.isAutoStaticSeparate[eid]) {
                            separateFromStaticColliders(eid, circ);
                        }
                    }
                    break;
                }
                case ColliderShape.Box: {
                    const box = collidersByEid.get(eid);
                    if (box) {
                        box.setPosition(Transform.x[eid], Transform.y[eid]);

                        if (Collider.isAutoStaticSeparate[eid]) {
                            separateFromStaticColliders(eid, box);
                        }
                    }
                    break;
                }
                default: break;
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