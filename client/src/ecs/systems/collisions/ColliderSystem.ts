import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import * as Collisions from 'detect-collisions';
import { Collider, ColliderShape } from "../../componets/collisions/Collider";
import { Transform } from "../../componets/Transform";
import { ClientPlayerInput } from "../../componets/ClientPlayerInput";

export const circleCollidersByEid = new Map<number, Collisions.Circle>();
export const boxCollidersByEid = new Map<number, Collisions.Box>();

export const createColliderSystem = (world: IWorld, system: Collisions.System) => {
    const onUpdate = defineQuery([Collider]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    // const circlesByEid = new Map<number, Collisions.Circle>();
    // const boxesByEid = new Map<number, Collisions.Box>();

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
                    circleCollidersByEid.set(eid, circ);
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
                    boxCollidersByEid.set(eid, box);
                    break;
                }
                default: break;
            }
        });

        onUpdate(world).forEach(eid => {
            switch (Collider.shape[eid]) {
                case ColliderShape.Circle: {
                    if (Collider.isAutoStaticSeparate[eid] && !hasComponent(world, ClientPlayerInput, eid)) {
                        const circ = circleCollidersByEid.get(eid);
                        trySeparateCircleColliderFromStatic(circ, eid);
                    }
                    break;
                }
                case ColliderShape.Box: {
                    const box = boxCollidersByEid.get(eid);
                    if (box) {
                        box.setPosition(Transform.x[eid], Transform.y[eid]);

                        if (Collider.isAutoStaticSeparate[eid]) {
                            system.checkOne(box, (response: Collisions.Response) => {
                                const { overlapV, b } = response;
                                if (b.isStatic) {
                                    box.setPosition(box.x - overlapV.x, box.y - overlapV.y);
                                    Transform.x[eid] = box.x;
                                    Transform.y[eid] = box.y;
                                }
                            });
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

export const trySeparateCircleColliderFromStatic = (circle: Collisions.Circle | undefined, eid: number) => {
    if (!circle) return;
    const system = circle.system;
    if (!system) return;

    circle.setPosition(Transform.x[eid], Transform.y[eid]);

    system.checkOne(circle, (response: Collisions.Response) => {
        const { overlapV, b } = response;
        if (b.isStatic) {
            circle.setPosition(circle.x - overlapV.x, circle.y - overlapV.y);
            Transform.x[eid] = circle.x;
            Transform.y[eid] = circle.y;
        }
    });
    
}