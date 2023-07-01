import { defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import { IWorld } from "bitecs";
import { GameScene } from "../../../internalExports";
import { Circle_Component } from "../../componets/render/Circle_Component";
import { Transform_Component } from "../../componets/core/Transform_Component";
import { Color_Component } from "../../componets/render/Color_Component";
import { Interpolate_Component } from "../../componets/render/Interpolate_Component";


export const createCircle_System = (gScene: GameScene) => {

    const qUpdate = defineQuery([Circle_Component]);
    const qEnter = enterQuery(qUpdate);
    const qExit = exitQuery(qUpdate);

    const circlesById = new Map<number, Phaser.GameObjects.Arc>();

    return defineSystem((world: IWorld) => {

        const onAdd = qEnter(world);
        onAdd.forEach(eid => {
            circlesById.set(eid, gScene.add.circle(
                Transform_Component.x[eid], 
                Transform_Component.y[eid], 
                Circle_Component.radius[eid],
                Color_Component.val[eid]
            ));
        });

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const circle = circlesById.get(eid);
            if (circle) {
                if (hasComponent(world, Interpolate_Component, eid)) {
                    circle.setPosition(
                        Interpolate_Component.x[eid],
                        Interpolate_Component.y[eid]
                    )
                } else {
                    circle.setPosition(
                        Transform_Component.x[eid],
                        Transform_Component.y[eid]
                    )
                }
                circle.fillColor = Color_Component.val[eid];
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