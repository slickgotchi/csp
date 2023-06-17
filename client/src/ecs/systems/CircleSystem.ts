import { defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import { IWorld } from "bitecs";
import { Circle } from "../componets/Circle";
import { Transform } from "../componets/Transform";
import { Color } from "../componets/Color";
import { Interpolate } from "../componets/Interpolate";


export const createCircleSystem = (world: IWorld, scene: Phaser.Scene) => {

    const qUpdate = defineQuery([Circle]);
    const qEnter = enterQuery(qUpdate);
    const qExit = exitQuery(qUpdate);

    const circlesById = new Map<number, Phaser.GameObjects.Arc>();

    return defineSystem((world: IWorld) => {

        const onAdd = qEnter(world);
        onAdd.forEach(eid => {
            circlesById.set(eid, scene.add.circle(
                Transform.x[eid], 
                Transform.y[eid], 
                Circle.radius[eid],
                Color.val[eid]
            ));
        });

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const circle = circlesById.get(eid);
            if (circle) {
                if (hasComponent(world, Interpolate, eid)) {
                    circle.setPosition(
                        Interpolate.x[eid],
                        Interpolate.y[eid]
                    )
                } else {
                    circle.setPosition(
                        Transform.x[eid],
                        Transform.y[eid]
                    )
                }
                circle.fillColor = Color.val[eid];
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