import { IWorld, defineQuery, defineSystem } from "bitecs"
import { GA_Move } from "../../../componets/gas/gameplay-abillities/GA_Move";
import { Transform } from "../../../componets/Transform";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { IInput, movePlayer } from "../../ClientPlayerInputSystem";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";
import { GameScene } from "../../../../scenes/GameScene";
import { GA_MeleeAttack } from "../../../componets/gas/gameplay-abillities/GA_MeleeAttack";
import { isActiveAbilities } from ".";


export const createGA_MoveSystem = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_Move]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Move.isActivated[eid]) {

                // move player
                movePlayer(gScene, eid, GA_Move.dx[eid], GA_Move.dy[eid]);

                // turn off activate tag
                GA_Move.isActivated[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Move = (eid: number, input: IInput) => {
    // 1. check blockers
    if (isActiveAbilities(eid)) return false;
    
    // 2. activate
    GA_Move.isActivated[eid] = 1;
    GA_Move.dx[eid] = input.dir.x * 400 * 0.1;
    GA_Move.dy[eid] = input.dir.y * 400 * 0.1;

    // 3. success
    return true;
}


