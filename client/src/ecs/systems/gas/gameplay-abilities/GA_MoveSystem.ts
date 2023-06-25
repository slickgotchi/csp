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
                // saveBuffer(room, eid);

                // turn off activate tag
                GA_Move.isActivated[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Move = (eid: number, input: IInput) => {
    // 1. check blockers
    if (GA_RangedAttack.isRunning[eid]) return false;
    if (GA_Dash.isRunning[eid]) return false;
    
    // 2. activate
    GA_Move.isActivated[eid] = 1;
    GA_Move.dx[eid] = input.dir.x * 400 * 0.1;
    GA_Move.dy[eid] = input.dir.y * 400 * 0.1;

    // 3. success
    return true;
}


