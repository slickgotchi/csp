import { IWorld, defineQuery, defineSystem } from "bitecs"
import { GA_Null } from "../../../componets/gas/gameplay-abillities/GA_Null";
import { Transform } from "../../../componets/Transform";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { IInput, pending_inputs } from "../../ClientPlayerInputSystem";
import { saveBuffer } from "../../InterpolateSystem";
import { Room } from "colyseus.js";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";


export const createGA_NullSystem = (room: Room) => {

    const onUpdate = defineQuery([GA_Null]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Null.isActivated[eid]) {

                // save to buffer
                saveBuffer(room, eid);

                // turn off activate tag
                GA_Null.isActivated[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Null = (eid: number, input: IInput) => {
    // 1. should never be blockers for null ability

    // 2. activate
    GA_Null.isActivated[eid] = 1;

    // 3. success
    return true;
}


