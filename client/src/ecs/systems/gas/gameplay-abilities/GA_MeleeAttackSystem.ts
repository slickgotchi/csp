import { IWorld, addComponent, defineQuery, defineSystem, hasComponent } from "bitecs";
import * as Collisions from 'detect-collisions';
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { ArcCircleCollider } from "../../collisions/ColliderSystem";
import { Enemy } from "../../../componets/Enemy";
import { tintFlash } from "../../server-message/routes/EnemyTakeDamageRoute";
import { Transform } from "../../../componets/Transform";
import { GA_MeleeAttack } from "../../../componets/gas/gameplay-abillities/GA_MeleeAttack";
import { saveBuffer } from "../../InterpolateSystem";
import { IInput, createMoveInput, logMoveInput } from "../../ClientPlayerInputSystem";
import { Room } from "colyseus.js";

export const createGA_MeleeAttackSystem = (scene: Phaser.Scene, room: Room, world: IWorld, collisions: Collisions.System) => {

    const onUpdate = defineQuery([GA_MeleeAttack]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_MeleeAttack.isActivated[eid]) {
                
                // 1. check collisions and play any enemy hit anims
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid],
                }
                const dir = {
                    x: GA_MeleeAttack.dx[eid],
                    y: GA_MeleeAttack.dy[eid]
                }
                playEnemyCollisionAnims(world, collisions, start, dir);

                // 2. render attack anim
                playMeleeAttackAnim(scene, world, eid, start, dir);

                // 3. activate done
                GA_MeleeAttack.isActivated[eid] = 0;

                // 0. move object
                logMoveInput(room, eid, createMoveInput(
                    "GA_Movement",
                    dir
                ))

                // 4. set a timeout on running
                setTimeout(() => {
                    GA_MeleeAttack.isRunning[eid] = 0;
                }, 200);
            }
        })

        return world;
    })
}

export const tryActivateGA_MeleeAttack = (eid: number, dx: number, dy: number) => {
    // 0. check not already running
    // if (GA_MeleeAttack.isRunning[eid]) return;

    // 1. check other ability blockers

    // 2. check ap

    // 3. check cooldown

    // 4. ok we can activate!
    GA_MeleeAttack.isActivated[eid] = 1;
    GA_MeleeAttack.isRunning[eid] = 1;
    GA_MeleeAttack.dx[eid] = dx;
    GA_MeleeAttack.dy[eid] = dy;
}

export const playMeleeAttackAnim = (scene: Phaser.Scene, world: IWorld, eid: number, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create circle
    const circ = scene.add.circle(
        start.x + dir.x*200,
        start.y + dir.y*200,
        150,
        0xffffff
    );
    circ.setAlpha(0.75);
    
    // tween
    scene.add.tween({
        targets: circ,
        alpha: 0,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
            circ.destroy();
        }
    })
}   


const playEnemyCollisionAnims = (world: IWorld, collisions: Collisions.System, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create a collider
    const hitCollider = collisions.createCircle(
        {x:0,y:0},
        150
    )

    // adjust hit collider pos/angle
    hitCollider.setPosition(start.x + dir.x*200, start.y + dir.y*200);

    // check collisions
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