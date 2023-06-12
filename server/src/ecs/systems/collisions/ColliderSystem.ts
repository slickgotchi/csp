import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import GameRoom from "../../../rooms/Game";
import * as Collisions from 'detect-collisions';
import { Collider, ColliderShape } from "../../components/collisions/Collider";
import { Transform } from "../../components/Transform";


export const createColliderSystem = (room: GameRoom, world: IWorld, system: Collisions.System) => {
    const onUpdate = defineQuery([Collider]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    const circlesByEid = new Map<number, Collisions.Circle>();
    const boxesByEid = new Map<number, Collisions.Box>();

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
                    circlesByEid.set(eid, circ);
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
                    boxesByEid.set(eid, box);
                    break;
                }
                default: break;
            }
        });

        onUpdate(world).forEach(eid => {
            switch (Collider.shape[eid]) {
                case ColliderShape.Circle: {
                    const circ = circlesByEid.get(eid);
                    if (circ) {
                        circ.setPosition(Transform.x[eid], Transform.y[eid]);

                        if (Collider.isAutoStaticSeparate[eid]) {
                            system.checkOne(circ, (response: Collisions.Response) => {
                                const { overlapV, b } = response;
                                if (b.isStatic) {
                                    circ.setPosition(circ.x - overlapV.x, circ.y - overlapV.y);
                                    Transform.x[eid] = circ.x;
                                    Transform.y[eid] = circ.y;
                                }
                            });
                        }
                    }
                    break;
                }
                case ColliderShape.Box: {
                    const box = boxesByEid.get(eid);
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