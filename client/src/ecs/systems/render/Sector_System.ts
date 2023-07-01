import { defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import { IWorld } from "bitecs";
import { GameScene } from "../../../internalExports";
import { Sector_Component } from "../../componets/render/Sector_Component";
import { ArcUtils } from "../../../utilities/ArcUtils";
import { Transform_Component } from "../../componets/core/Transform_Component";
import { Color_Component } from "../../componets/render/Color_Component";
import { Interpolate_Component } from "../../componets/render/Interpolate_Component";

export const generateSectorPoints = (radius: number, spread: number, detail: number = 10) => {
    const points = [];
    const r = radius;
    const a = spread;
    const delta = a / detail;

    points.push([0,0]);

    for (let i = 0; i < detail+1; i++) {
        points.push([
            r*Math.sin(a/2-i*delta), 
            r*Math.cos(a/2-i*delta)
        ])
    }

    return points;
}

export const createSector_System = (gScene: GameScene) => {

    const qUpdate = defineQuery([Sector_Component]);
    const qEnter = enterQuery(qUpdate);
    const qExit = exitQuery(qUpdate);

    const sectorsById = new Map<number, Phaser.GameObjects.Polygon>();
    const isTweenRunningByEid = new Map<number, boolean>();

    return defineSystem((world: IWorld) => {

        const onAdd = qEnter(world);
        onAdd.forEach(eid => {
            const points = ArcUtils.Shape.createSectorPoints({x:0,y:0},{x:0,y:1},Sector_Component.spreadDegrees[eid],Sector_Component.radius[eid]);

            const sector = gScene.add.polygon(
                Transform_Component.x[eid], 
                Transform_Component.y[eid], 
                points,
                Color_Component.val[eid]
            );
            sector.setOrigin(0,0);

            sectorsById.set(eid, sector);

            isTweenRunningByEid.set(eid, false);
        });

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const sector = sectorsById.get(eid);
            if (sector) {
                if (hasComponent(world, Interpolate_Component, eid)) {
                    sector.setPosition(
                        Interpolate_Component.x[eid],
                        Interpolate_Component.y[eid]
                    )
                } else {
                    sector.setPosition(
                        Transform_Component.x[eid],
                        Transform_Component.y[eid]
                    )
                }
                const dt = {t: 0}
                const radA = ArcUtils.Angle.degToRad(sector.angle);
                const radB = ArcUtils.Angle.degToRad(Sector_Component.angle[eid]);
                if (!isTweenRunningByEid.get(eid) && Math.abs(radA-radB) > 0.1) {
                    isTweenRunningByEid.set(eid, true);
                    gScene.add.tween({
                        targets: dt,
                        t: 1,
                        onUpdate: () => {
                            const radLerp = ArcUtils.Angle.lerp(radA, radB, dt.t);
                            sector.setRotation(radLerp);
                        },
                        onComplete: () => {
                            isTweenRunningByEid.set(eid, false);
                        },
                        duration: 100,
                    })
                }
                // sector.setAngle(Sector.angle[eid]);
                sector.fillColor = Color_Component.val[eid]; 
                sector.setAlpha(Sector_Component.alpha[eid]);
                sector.setVisible(Sector_Component.visible[eid] === 1);
            }
        })

        const onRemove = qExit(world);
        onRemove.forEach(eid => {
            sectorsById.get(eid)?.destroy();
            sectorsById.delete(eid);
        });

        return world;
    })
}