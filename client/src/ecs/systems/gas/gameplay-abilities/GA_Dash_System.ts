import { IWorld, defineQuery, defineSystem } from "bitecs";
import { IInput, movePlayer, GameScene } from "../../../../internalExports";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { isActiveAbilities } from ".";
import { GA_Dash_Component } from "../../../componets/gas/gameplay-abillities/GA_Dash_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";

export const createGA_Dash_System = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_Dash_Component]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Dash_Component.isActivated[eid]) {

                // save start for anim
                const start = { x: Transform_Component.x[eid], y: Transform_Component.y[eid] }

                // move player
                movePlayer(gScene, eid, GA_Dash_Component.dx[eid], GA_Dash_Component.dy[eid]);

                // save finish for anim
                const finish = { x: Transform_Component.x[eid], y: Transform_Component.y[eid] }

                // play anim
                playAnimGA_Dash(gScene, start, finish);

                // turn off activate tag
                GA_Dash_Component.isActivated[eid] = 0;

                // leave running for small duration
                setTimeout(() => {
                    GA_Dash_Component.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_Dash = (eid: number, input: IInput) => {
    // 1. check blockers
    if (isActiveAbilities(eid)) return false;
    
    // 2. activate
    GA_Dash_Component.isActivated[eid] = 1;
    GA_Dash_Component.isRunning[eid] = 1;
    GA_Dash_Component.dx[eid] = input.dir.x * 500;
    GA_Dash_Component.dy[eid] = input.dir.y * 500;

    // pending_inputs.push(input);
    return true;
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


