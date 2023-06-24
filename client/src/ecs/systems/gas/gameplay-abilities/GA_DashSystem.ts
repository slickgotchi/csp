import { IWorld, defineQuery, defineSystem } from "bitecs"
import { Transform } from "../../../componets/Transform";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { IInput, pending_inputs } from "../../ClientPlayerInputSystem";
import { saveBuffer } from "../../InterpolateSystem";
import { Room } from "colyseus.js";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";

export const createGA_DashSystem = (room: Room) => {

    const onUpdate = defineQuery([GA_Dash]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Dash.isActivated[eid]) {

                // 3. apply move input
                Transform.x[eid] += GA_Dash.dx[eid];
                Transform.y[eid] += GA_Dash.dy[eid];

                // 4. separate from colliders
                separateFromStaticColliders(eid, collidersByEid.get(eid));

                // save to buffer
                saveBuffer(room, eid);

                // turn off activate tag
                GA_Dash.isActivated[eid] = 0;

                setTimeout(() => {
                    GA_Dash.isRunning[eid] = 0;
                }, 1000);
            }
        })

        return world;
    })
}

export const tryActivateGA_Dash = (eid: number, input: IInput) => {
    if (GA_RangedAttack.isRunning[eid]) return;
    
    GA_Dash.isActivated[eid] = 1;
    GA_Dash.isRunning[eid] = 1;
    GA_Dash.dx[eid] = input.dir.x * 500;
    GA_Dash.dy[eid] = input.dir.y * 500;

    pending_inputs.push(input);
}


export const playDashAnim = (scene: Phaser.Scene, start: {x:number,y:number}, finish: {x:number,y:number}) => {
    // export const playDashAnim = (scene: Phaser.Scene, dx: number, dy: number, eid: number, duration_ms: number) => {
        const line = scene.add.line(
            0,
            0,
            start.x,
            start.y,
            finish.x,
            finish.y,
            0x66ff66
        )
            .setOrigin(0,0)
            .setDepth(-1)
            .setAlpha(0)
    
        scene.add.tween({
            targets: line,
            alpha: 1,
            duration: 125,
            yoyo: true,
            onComplete: () => {
                line.destroy();
            }
        });
    }


