import { IWorld, defineQuery, defineSystem } from "bitecs"
import { Transform } from "../../../componets/Transform";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { IInput, pending_inputs } from "../../ClientPlayerInputSystem";
import { saveBuffer } from "../../InterpolateSystem";
import { Room } from "colyseus.js";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";
import { Player } from "../../../componets/Player";
import { GameScene } from "../../../../scenes/GameScene";
import { ArcUtils } from "../../../../utilities/ArcUtils";

export const createGA_DashSystem = (gameScene: GameScene) => {

    const onUpdate = defineQuery([Player, GA_Dash]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Dash.isActivated[eid]) {

                // save start
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }

                // 3. apply move input
                Transform.x[eid] += GA_Dash.dx[eid];
                Transform.y[eid] += GA_Dash.dy[eid];

                // 4. separate from colliders
                separateFromStaticColliders(eid, collidersByEid.get(eid));

                // save start
                const finish = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }

                // play anim
                playDashAnim(gameScene, start, finish);

                // save to buffer
                // saveBuffer(gameScene.room, eid);

                // turn off activate tag
                GA_Dash.isActivated[eid] = 0;

                setTimeout(() => {
                    GA_Dash.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_Dash = (eid: number, input: IInput) => {
    // 1. check blockers
    if (GA_RangedAttack.isRunning[eid]) return false;
    
    // 2. activate
    GA_Dash.isActivated[eid] = 1;
    GA_Dash.isRunning[eid] = 1;
    GA_Dash.dx[eid] = input.dir.x * 500;
    GA_Dash.dy[eid] = input.dir.y * 500;

    // pending_inputs.push(input);
    return true;
}

const makeFadeCircle = (scene: Phaser.Scene, pos: {x:number,y:number}, radius: number, color: number) => {
    const circ = scene.add.circle(
        pos.x,
        pos.y,
        radius,
        color
    );
    circ.setDepth(-1);

    scene.add.tween({
        targets: circ,
        alpha: 0,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: () => {
            circ.destroy();
        }
    });
}

/**
 * 
 * @param scene 
 * @param start 
 * @param finish 
 */
export const playDashAnim = (scene: Phaser.Scene, start: {x:number,y:number}, finish: {x:number,y:number}) => {
    // const line = scene.add.line(
    //     0,
    //     0,
    //     start.x,
    //     start.y,
    //     finish.x,
    //     finish.y,
    //     0x14C272
    // )
    //     .setOrigin(0,0)
    //     .setDepth(-10)
    //     .setAlpha(0)

    // scene.add.tween({
    //     targets: line,
    //     alpha: 0.5,
    //     duration: 125,
    //     yoyo: true,
    //     onComplete: () => {
    //         line.destroy();
    //     }
    // });

    // create 3 circles along the line of the dash
    const a = ArcUtils.Vector2.lerp(start, finish, 1/3*0.5);
    const b = ArcUtils.Vector2.lerp(start, finish, 0.5);
    const c = ArcUtils.Vector2.lerp(start, finish, 0.5 + 2/3*0.5);

    setTimeout(() => { makeFadeCircle(scene, a, 50, 0x14C272) }, 50);
    setTimeout(() => { makeFadeCircle(scene, b, 50, 0x2FA5C8) }, 100);
    setTimeout(() => { makeFadeCircle(scene, c, 50, 0x9D1A8C) }, 150);
}


