import { IWorld, defineQuery, defineSystem } from "bitecs"
import { GA_Null } from "../../../componets/gas/gameplay-abillities/GA_Null";
import { IInput, movePlayer, pending_inputs } from "../../ClientPlayerInputSystem";
import { GameScene } from "../../../../scenes/GameScene";


export const createGA_NullSystem = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_Null]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Null.isActivated[eid]) {

                // 1. log a zero movement and don't check collisions
                movePlayer(gScene, eid, 0, 0, false);

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

