import { defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";
import { IWorld } from "bitecs";
import { Transform } from "../componets/Transform";
import { Color } from "../componets/Color";
import { Interpolate } from "../componets/Interpolate";
import { GameScene } from "../../scenes/GameScene";
import { Sector } from "../componets/Sector";
import { ArcUtils } from "../../utilities/ArcUtils";

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

export const createSectorSystem = (gScene: GameScene) => {

    const qUpdate = defineQuery([Sector]);
    const qEnter = enterQuery(qUpdate);
    const qExit = exitQuery(qUpdate);

    const sectorsById = new Map<number, Phaser.GameObjects.Polygon>();
    const isTweenRunningByEid = new Map<number, boolean>();

    return defineSystem((world: IWorld) => {

        const onAdd = qEnter(world);
        onAdd.forEach(eid => {
            const points = ArcUtils.Shape.createSectorPoints({x:0,y:0},{x:0,y:1},Sector.spreadDegrees[eid],Sector.radius[eid]);

            const sector = gScene.add.polygon(
                Transform.x[eid], 
                Transform.y[eid], 
                points,
                Color.val[eid]
            );
            sector.setOrigin(0,0);

            sectorsById.set(eid, sector);

            isTweenRunningByEid.set(eid, false);
        });

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const sector = sectorsById.get(eid);
            if (sector) {
                if (hasComponent(world, Interpolate, eid)) {
                    sector.setPosition(
                        Interpolate.x[eid],
                        Interpolate.y[eid]
                    )
                } else {
                    sector.setPosition(
                        Transform.x[eid],
                        Transform.y[eid]
                    )
                }
                const dt = {t: 0}
                const radA = ArcUtils.Angle.degToRad(sector.angle);
                const radB = ArcUtils.Angle.degToRad(Sector.angle[eid]);
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
                sector.fillColor = Color.val[eid]; 
                sector.setAlpha(Sector.alpha[eid]);
                sector.setVisible(Sector.visible[eid] === 1);
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