import { IWorld, defineQuery, defineSystem } from "bitecs"
import { GA_Move } from "../../../componets/gas/gameplay-abillities/GA_Move";
import { Transform } from "../../../componets/Transform";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { IInput, pending_inputs } from "../../ClientPlayerInputSystem";
import { saveBuffer } from "../../InterpolateSystem";
import { Room } from "colyseus.js";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";


export const createGA_MoveSystem = (room: Room) => {

    const onUpdate = defineQuery([GA_Move]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Move.isActivated[eid]) {

                // 3. apply move input
                Transform.x[eid] += GA_Move.dx[eid];
                Transform.y[eid] += GA_Move.dy[eid];

                // 4. separate from colliders
                separateFromStaticColliders(eid, collidersByEid.get(eid));

                // save to buffer
                saveBuffer(room, eid);

                // turn off activate tag
                GA_Move.isActivated[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Move = (eid: number, input: IInput) => {
    
    let vel = input.targetGA === "GA_Idol" ? 0 : 400;
    
    if (GA_RangedAttack.isRunning[eid]) vel = 0;
    if (GA_Dash.isRunning[eid]) vel = 0;
    
    GA_Move.isActivated[eid] = 1;
    GA_Move.dx[eid] = input.dir.x * vel * 0.1;
    GA_Move.dy[eid] = input.dir.y * vel * 0.1;

    pending_inputs.push(input);
}

// export const applyInputGA_Move = (eid: number, input: IInput) => {
//     // apply input
//     const vel = input.targetGA === "GA_Idol" ? 0 : 400;

//     Transform.x[eid] += input.dir.x * vel * 0.1;
//     Transform.y[eid] += input.dir.y * vel * 0.1;

//     // separate from static colliders
//     separateFromStaticColliders(eid, collidersByEid.get(eid));
// }


