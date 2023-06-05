import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import { IWorld } from "bitecs";
import { Circle } from "../componets/Circle";
import { Transform } from "../componets/Transform";
import { Color } from "../componets/Color";


export const createCircleSystem = (world: IWorld, scene: Phaser.Scene) => {

    const qUpdate = defineQuery([Circle]);
    const qEnter = enterQuery(qUpdate);
    const qExit = exitQuery(qUpdate);

    const circlesById = new Map<number, Phaser.GameObjects.Arc>();

    return defineSystem((world: IWorld) => {

        const onAdd = qEnter(world);
        onAdd.forEach(eid => {
            circlesById.set(eid, scene.add.circle(
                Transform.position.x[eid], 
                Transform.position.y[eid], 
                Circle.radius[eid],
                Color.val[eid]
            ));
        });

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const circle = circlesById.get(eid);
            if (circle) {
                circle.setPosition(
                    Transform.position.x[eid],
                    Transform.position.y[eid]
                )
            }
        })

        const onRemove = qExit(world);
        onRemove.forEach(eid => {
            circlesById.get(eid)?.destroy();
            circlesById.delete(eid);
        });

        return world;
    })
}