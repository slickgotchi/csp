import { defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import { IWorld } from "bitecs";
import { Transform } from "../componets/Transform";
import { Color } from "../componets/Color";
import { Interpolate } from "../componets/Interpolate";
import { Rectangle } from "../componets/Rectangle";
import { GameScene } from "../../scenes/GameScene";


export const createRectangleSystem = (gScene: GameScene) => {

    const qUpdate = defineQuery([Rectangle]);
    const qEnter = enterQuery(qUpdate);
    const qExit = exitQuery(qUpdate);

    const rectsByEid = new Map<number, Phaser.GameObjects.Rectangle>();

    return defineSystem((world: IWorld) => {

        const onAdd = qEnter(world);
        onAdd.forEach(eid => {
            const rect = gScene.add.rectangle(
                Transform.x[eid], 
                Transform.y[eid], 
                Rectangle.width[eid],
                Rectangle.height[eid],
                Color.val[eid]
            )
                .setOrigin(0,0);
                
            rectsByEid.set(eid, rect);
        });

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const rect = rectsByEid.get(eid);
            if (rect) {
                if (hasComponent(world, Interpolate, eid)) {
                    rect.setPosition(
                        Interpolate.x[eid],
                        Interpolate.y[eid]
                    )
                } else {
                    rect.setPosition(
                        Transform.x[eid],
                        Transform.y[eid]
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