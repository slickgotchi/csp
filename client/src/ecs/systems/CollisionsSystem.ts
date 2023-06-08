import { IWorld, defineQuery, defineSystem, enterQuery } from 'bitecs';
import * as Collisions from 'detect-collisions';
import { CircleCollider } from '../componets/CircleCollider';
import { BoxCollider } from '../componets/BoxCollider';

export const circleCollidersByEid = new Map<number, Collisions.Circle>();

export const createCollisionsSystem = (collisionSystem: Collisions.System) => {

    const onUpdateCircleCollider = defineQuery([CircleCollider]);
    const onAddCircleCollider = enterQuery(onUpdateCircleCollider);

    const onUpdateBoxCollider = defineQuery([BoxCollider]);
    const onAddBoxCollider = enterQuery(onUpdateBoxCollider);
    const boxCollidersByEid = new Map<number, Collisions.Box>();

    return defineSystem((world: IWorld) => {

        onAddCircleCollider(world).forEach(eid => {
            circleCollidersByEid.set(eid, collisionSystem.createCircle(
                {x: 0, y: 0},
                CircleCollider.radius[eid]
            ));
        });

        // onAddBoxCollider(world).forEach(eid => {
        //     boxCollidersByEid.set(eid, collisionSystem.createBox(
        //         {x: 0, y: 0},
        //         BoxCollider.width[eid],
        //         BoxCollider.height[eid]
        //     ))
        // })

        return world;
    });
}