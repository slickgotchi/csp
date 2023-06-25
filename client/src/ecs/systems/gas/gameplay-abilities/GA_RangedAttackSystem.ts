import { IWorld, defineQuery, defineSystem, hasComponent } from "bitecs";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import * as Collisions from 'detect-collisions';
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { ArcCircleCollider } from "../../collisions/ColliderSystem";
import { Enemy } from "../../../componets/Enemy";
import { tintFlash } from "../../server-message/routes/EnemyTakeDamageRoute";
import { Transform } from "../../../componets/Transform";
import { IInput } from "../../ClientPlayerInputSystem";
import { GameScene } from "../../../../scenes/GameScene";

export const createGA_RangedAttackSystem = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_RangedAttack]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_RangedAttack.isActivated[eid]) {
                // 1. check collisions and play any enemy hit anims
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid],
                }
                const dir = {
                    x: GA_RangedAttack.dx[eid],
                    y: GA_RangedAttack.dy[eid]
                }
                playEnemyCollisionAnims(world, gScene.collisions, start, dir);

                // 2. render attack anim
                playRangedAttackAnim(gScene, world, eid, start, dir);

                // 3. activate done
                GA_RangedAttack.isActivated[eid] = 0;

                // 4. set a timeout on running
                setTimeout(() => {
                    GA_RangedAttack.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_RangedAttack = (eid: number, input: IInput) => {
    // 0. check not already running
    if (GA_RangedAttack.isRunning[eid]) return;

    // 1. check other ability blockers

    // 2. check ap

    // 3. check cooldown

    // 4. ok we can activate!
    GA_RangedAttack.isActivated[eid] = 1;
    GA_RangedAttack.isRunning[eid] = 1;
    GA_RangedAttack.dx[eid] = input.dir.x;
    GA_RangedAttack.dy[eid] = input.dir.y;

    // 3. success
    return true;
}

export const applyInputGA_RangedAttack = (eid: number, input: IInput) => {

}

export const playRangedAttackAnim = (scene: Phaser.Scene, world: IWorld, eid: number, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create circle
    const circ = scene.add.circle(
        start.x + dir.x * 85,
        start.y + dir.y * 85,
        35,
        0xffffff
    );
    circ.setAlpha(0.75);
    
    // tween
    scene.add.tween({
        targets: circ,
        x: start.x + dir.x*1000,
        y: start.y + dir.y*1000,
        duration: 250,
        alpha: 0,
        onComplete: () => {
            circ.destroy();
        }
    });

    // GA_RangedAttack.activated[eid] = 1;
}

const playEnemyCollisionAnims = (world: IWorld, collisions: Collisions.System, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    const WIDTH = 1000;
    const HEIGHT = 70;
    
    const hitCollider = collisions.createBox(
        {x:0,y:0},
        WIDTH,
        HEIGHT, {
            isCentered: true
        }
    )

    // adjust hit collider pos/angle
    hitCollider.setPosition(start.x + dir.x*WIDTH/2, start.y + dir.y*WIDTH/2);
    hitCollider.setAngle(Collisions.deg2rad(ArcUtils.Angle.fromVector2(dir)));
    collisions.insert(hitCollider); // need this to update bbox for hit collider

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