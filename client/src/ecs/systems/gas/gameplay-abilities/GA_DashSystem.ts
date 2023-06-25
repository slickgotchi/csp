import { IWorld, defineQuery, defineSystem } from "bitecs"
import { Transform } from "../../../componets/Transform";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { IInput } from "../../ClientPlayerInputSystem";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";
import { Player } from "../../../componets/Player";
import { GameScene } from "../../../../scenes/GameScene";
import { ArcUtils } from "../../../../utilities/ArcUtils";

export const createGA_DashSystem = (gScene: GameScene) => {

    const onUpdate = defineQuery([Player, GA_Dash]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Dash.isActivated[eid]) {

                // save start for anim
                const start = { x: Transform.x[eid], y: Transform.y[eid] }

                // 3. apply move input
                Transform.x[eid] += GA_Dash.dx[eid];
                Transform.y[eid] += GA_Dash.dy[eid];

                // 4. separate from colliders
                separateFromStaticColliders(eid, collidersByEid.get(eid));

                // save finish for anim
                const finish = { x: Transform.x[eid], y: Transform.y[eid] }

                // play anim
                playAnimGA_Dash(gScene, start, finish);

                // turn off activate tag
                GA_Dash.isActivated[eid] = 0;

                // leave running for small duration
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

export const applyInputGA_Dash = (eid: number, input: IInput) => {
    Transform.x[eid] += input.dir.x * 500;
    Transform.y[eid] += input.dir.y * 500;

    // separate from static colliders
    separateFromStaticColliders(eid, collidersByEid.get(eid));
}

// play dash anim
export const playAnimGA_Dash = (scene: Phaser.Scene, start: {x:number,y:number}, finish: {x:number,y:number}) => {
    // create 3 circles along the line of the dash
    const a = ArcUtils.Vector2.lerp(start, finish, 1/3*0.5);
    const b = ArcUtils.Vector2.lerp(start, finish, 0.5);
    const c = ArcUtils.Vector2.lerp(start, finish, 0.5 + 2/3*0.5);

    setTimeout(() => { ArcUtils.Draw.makeFadeCircle(scene, a, 50, 0x14C272) }, 50);
    setTimeout(() => { ArcUtils.Draw.makeFadeCircle(scene, b, 50, 0x2FA5C8) }, 100);
    setTimeout(() => { ArcUtils.Draw.makeFadeCircle(scene, c, 50, 0x9D1A8C) }, 150);
}


