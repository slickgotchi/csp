import { IWorld, defineQuery, defineSystem, hasComponent } from "bitecs";
import * as Collisions from 'detect-collisions';
import { ArcCircleCollider } from "../../collisions/ColliderSystem";
import { Enemy } from "../../../componets/Enemy";
import { Transform } from "../../../componets/Transform";
import { GA_PortalMageAxe } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe";
import { IInput, movePlayer } from "../../ClientPlayerInputSystem";
import { GameScene } from "../../../../scenes/GameScene";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { isActiveAbilities } from ".";
import { generateSectorPoints } from "../../SectorSystem";
import { playAnimGA_MeleeAttack } from "./GA_MeleeAttackSystem";

const createSectorColliderPoints = (start: {x:number,y:number}, dir: {x:number,y:number}, spread: number = 60, radius: number = 500) => {
    const pointsArray = generateSectorPoints(radius, ArcUtils.Angle.degToRad(spread), 4);
    const points: any[] = [];
    const theta = ArcUtils.Angle.fromVector2(dir, false) - Math.PI/2;
    pointsArray.forEach(pnt => {
        const x0 = pnt[0];
        const y0 = pnt[1];
        const x1 = x0*Math.cos(theta) - y0*Math.sin(theta);
        const y1 = y0*Math.cos(theta) + x0*Math.sin(theta);
        points.push({
            x: x1 + start.x,
            y: y1 + start.y
        });
    });
    return points;
}

// GA_PortalMageAxe
// Description: 
//  1. sector targeting reticle
//  2. lunge towards closest player in reticle
//  3. perform melee attack
//  4. look for another player with 500 radius
//  5. melee attack
//  6. repeat again on 3rd player

export const createGA_PortalMageAxeSystem = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_PortalMageAxe]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_PortalMageAxe.isActivated[eid]) {
                
                // 1. store start and direction
                const start = { x: Transform.x[eid], y: Transform.y[eid], }
                const dir = { x: GA_PortalMageAxe.dir.x[eid], y: GA_PortalMageAxe.dir.y[eid] }

                // 2. build hitCollider with spread 60deg and radius 500
                // const points = ArcUtils.Shape.createSectorPoints(start, dir, 60, 500, 4);
                // ArcUtils.Draw.makeFadePolygon(gScene, points, 0xffffff, 1000);

                // 3. find nearest hit enemy
                const targetEidA = getNearestHitEid(world, gScene.collisions, start, dir);

                // 4. if got a target, move towards it
                if (targetEidA) {
                    const enemyPos = {
                        x: Transform.x[targetEidA],
                        y: Transform.y[targetEidA]
                    }
                    let dir = {
                        x: enemyPos.x - start.x,
                        y: enemyPos.y - start.y
                    }
                    dir = ArcUtils.Vector2.normalise(dir);


                    const newPos = {
                        x: enemyPos.x - dir.x*90,
                        y: enemyPos.y - dir.y*90,
                    }

                    // move to first position
                    movePlayer(gScene, eid, newPos.x - start.x, newPos.y - start.y);
                    playAnimGA_MeleeAttack(gScene, gScene.world, eid, newPos, dir);
                }

                // 3. render attack anim
                playAnimGA_PortalMageAxe(gScene, world, eid, start, dir);

                // 3. activate done
                GA_PortalMageAxe.isActivated[eid] = 0;

                // 4. set a timeout on running
                setTimeout(() => {
                    GA_PortalMageAxe.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_PortalMageAxe = (eid: number, input: IInput) => {
    // 1. check ability blockers
    if (isActiveAbilities(eid)) return false;

    // 2. ok we can activate!
    GA_PortalMageAxe.isActivated[eid] = 1;
    GA_PortalMageAxe.isRunning[eid] = 1;
    GA_PortalMageAxe.dir.x[eid] = input.dir.x;
    GA_PortalMageAxe.dir.y[eid] = input.dir.y;

    // 3. success
    return true;
}

export const playAnimGA_PortalMageAxe = (scene: Phaser.Scene, world: IWorld, eid: number, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    
}   

const getNearestHitEid = (world: IWorld, collisions: Collisions.System, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create a collider
    const points = createSectorColliderPoints(start, dir);
    const hitCollider = collisions.createPolygon( {x:0, y:0}, points );

    // check collision
    let nearestEid = 0;
    let closestDist = 1e9;
    collisions.checkOne(hitCollider, response => {
        const { b } = response;
        const goEid = (b as ArcCircleCollider).eid;

        // do tint flashes if we got a hit
        if (hasComponent(world, Enemy, goEid)) {
            // get location
            const enemyPos = {
                x: Transform.x[goEid],
                y: Transform.y[goEid],
            }

            const dist = ArcUtils.Vector2.distance(start, enemyPos);
            if (dist < closestDist) {
                nearestEid = goEid;
                closestDist = dist;
            }
        }
    });

    return nearestEid;
}
