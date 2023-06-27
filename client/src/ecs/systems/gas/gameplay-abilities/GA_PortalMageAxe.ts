import { IWorld, defineQuery, defineSystem, hasComponent } from "bitecs";
import * as Collisions from 'detect-collisions';
import { ArcCircleCollider, collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Enemy } from "../../../componets/Enemy";
import { tintFlash } from "../../server-message/routes/EnemyTakeDamageRoute";
import { Transform } from "../../../componets/Transform";
import { GA_PortalMageAxe } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe";
import { IInput, createMoveSpecialInput, pending_inputs, sequence_number } from "../../ClientPlayerInputSystem";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GameScene } from "../../../../scenes/GameScene";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { isActiveAbilities } from ".";
import { generateSectorPoints } from "../../SectorSystem";
import { Circle } from "../../../componets/Circle";
import { saveBuffer } from "../../InterpolateSystem";

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

export const createGA_PortalMageAxeSystem = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_PortalMageAxe]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_PortalMageAxe.isActivated[eid]) {
                
                // 1. store start and direction
                const start = { x: Transform.x[eid], y: Transform.y[eid], }
                const dir = { x: GA_PortalMageAxe.dir.x[eid], y: GA_PortalMageAxe.dir.y[eid] }

                // 2. build hitCollider with spread 60deg and radius 500
                const points = ArcUtils.Shape.createSectorPoints(start, dir, 60, 500, 4);
                ArcUtils.Draw.makeFadePolygon(gScene, points, 0xffffff, 1000);

                // 3. find nearest hit enemy
                const targetEidA = getNearestHitEid(world, gScene.collisions, start, dir);
                
                // 4. if got a target, move towards it
                if (targetEidA) {
                    const enemyPos = {
                        x: Transform.x[targetEidA],
                        y: Transform.y[targetEidA]
                    }
                    let vec = {
                        x: enemyPos.x - start.x,
                        y: enemyPos.y - start.y
                    }
                    vec = ArcUtils.Vector2.normalise(vec);

                    const newPos = {
                        x: enemyPos.x - vec.x*(Circle.radius[targetEidA] + Circle.radius[eid]),
                        y: enemyPos.x - vec.y*(Circle.radius[targetEidA] + Circle.radius[eid]),
                    }

                    moveSpecial(gScene, eid, newPos.x - start.x, newPos.y - start.y);
                    Transform.x[eid] = newPos.x;
                    Transform.y[eid] = newPos.y;
                }


                // playEnemyCollisionAnims(world, gScene.collisions, start, dir);

                // 2. move
                // Transform.x[eid] += GA_PortalMageAxe.dir.x[eid];
                // Transform.y[eid] += GA_PortalMageAxe.dir.y[eid];
                separateFromStaticColliders(eid, collidersByEid.get(eid));

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

const moveSpecial = (gScene: GameScene, eid: number, dx: number, dy: number) => {
    // create an input
    const input = createMoveSpecialInput(dx, dy);

    // update server with latest input
    gScene.room.send("client-input", input);

    // add to inputs
    pending_inputs.push(input);

    // save buffer
    saveBuffer(gScene.room, eid);
}

export const applyInputMoveSpecial = (eid: number, input: IInput) => {
    Transform.x[eid] += input.dir.x;
    Transform.y[eid] += input.dir.y;

    separateFromStaticColliders(eid, collidersByEid.get(eid));
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

export const applyInputGA_PortalMageAxe = (eid: number, input: IInput) => {
    // Transform.x[eid] += input.dir.x * 100;
    // Transform.y[eid] += input.dir.y * 100;
    separateFromStaticColliders(eid, collidersByEid.get(eid));
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


const playEnemyCollisionAnims = (world: IWorld, collisions: Collisions.System, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create a collider
    const points = createSectorColliderPoints(start, dir);
    const hitCollider = collisions.createPolygon( {x:0, y:0}, points );

    // adjust hit collider pos/angle
    // hitCollider.setPosition(start.x + dir.x*200, start.y + dir.y*200);

    // check collision
    collisions.checkOne(hitCollider, response => {
        const { b } = response;
        const goEid = (b as ArcCircleCollider).eid;

        // do tint flashes if we got a hit
        if (hasComponent(world, Enemy, goEid)) {
            setTimeout(() => {
                tintFlash(goEid);
            }, 100)
        }
    })
}