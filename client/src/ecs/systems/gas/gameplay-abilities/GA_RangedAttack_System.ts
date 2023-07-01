import { IWorld, defineQuery, defineSystem, hasComponent } from "bitecs";
import * as Collisions from 'detect-collisions';
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { tintFlash } from "../../network/routes/EnemyTakeDamageRoute";
import { IInput } from "../../input/ClientPlayerInput_System";
import { GameScene } from "../../../../scenes/GameScene";
import { isActiveAbilities } from ".";
import { GA_RangedAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { ArcCircleCollider } from "../../collisions/Collider_System";
import { ASC_Enemy_Component } from "../../../componets/gas/ability-system-components/ASC_Enemy_Component";

export const createGA_RangedAttack_System = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_RangedAttack_Component]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_RangedAttack_Component.isActivated[eid]) {
                // 1. check collisions and play any enemy hit anims
                const start = {
                    x: Transform_Component.x[eid],
                    y: Transform_Component.y[eid],
                }
                const dir = {
                    x: GA_RangedAttack_Component.dx[eid],
                    y: GA_RangedAttack_Component.dy[eid]
                }
                playEnemyCollisionAnims(world, gScene.collisions, start, dir);

                // 2. render attack anim
                playRangedAttackAnim(gScene, world, eid, start, dir);

                // 3. activate done
                GA_RangedAttack_Component.isActivated[eid] = 0;

                // 4. set a timeout on running
                setTimeout(() => {
                    GA_RangedAttack_Component.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_RangedAttack = (eid: number, input: IInput) => {
    // 0. check not already running
    if (isActiveAbilities(eid)) return false;

    // 2. ok we can activate!
    GA_RangedAttack_Component.isActivated[eid] = 1;
    GA_RangedAttack_Component.isRunning[eid] = 1;
    GA_RangedAttack_Component.dx[eid] = input.dir.x;
    GA_RangedAttack_Component.dy[eid] = input.dir.y;

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
        if (hasComponent(world, ASC_Enemy_Component, goEid)) {
            setTimeout(() => {
                tintFlash(goEid);
            }, 100)
        }
    })
}