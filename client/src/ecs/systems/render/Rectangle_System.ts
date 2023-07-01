import { defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import { IWorld } from "bitecs";
import { GameScene } from "../../../scenes/GameScene";
import { Rectangle_Component } from "../../componets/render/Rectangle_Component";
import { Transform_Component } from "../../componets/core/Transform_Component";
import { Color_Component } from "../../componets/render/Color_Component";
import { Interpolate_Component } from "../../componets/render/Interpolate_Component";


export const createRectangle_System = (gScene: GameScene) => {

    const qUpdate = defineQuery([Rectangle_Component]);
    const qEnter = enterQuery(qUpdate);
    const qExit = exitQuery(qUpdate);

    const rectsByEid = new Map<number, Phaser.GameObjects.Rectangle>();

    return defineSystem((world: IWorld) => {

        const onAdd = qEnter(world);
        onAdd.forEach(eid => {
            const rect = gScene.add.rectangle(
                Transform_Component.x[eid], 
                Transform_Component.y[eid], 
                Rectangle_Component.width[eid],
                Rectangle_Component.height[eid],
                Color_Component.val[eid]
            )
                .setOrigin(0,0);
                
            rectsByEid.set(eid, rect);
        });

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const rect = rectsByEid.get(eid);
            if (rect) {
                if (hasComponent(world, Interpolate_Component, eid)) {
                    rect.setPosition(
                        Interpolate_Component.x[eid],
                        Interpolate_Component.y[eid]
                    )
                } else {
                    rect.setPosition(
                        Transform_Component.x[eid],
                        Transform_Component.y[eid]
                    )
                }
            }
        })

        const onRemove = qExit(world);
        onRemove.forEach(eid => {
            rectsByEid.get(eid)?.destroy();
            rectsByEid.delete(eid);
        });

        return world;
    })
}