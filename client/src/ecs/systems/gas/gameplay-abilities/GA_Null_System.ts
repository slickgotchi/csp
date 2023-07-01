import { IWorld, defineQuery, defineSystem } from "bitecs"
import { IInput, movePlayer, GameScene } from "../../../../internalExports";
import { GA_Null_Component } from "../../../componets/gas/gameplay-abillities/GA_Null_Component";


export const createGA_Null_System = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_Null_Component]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Null_Component.isActivated[eid]) {

                // 1. log a zero movement and don't check collisions
                movePlayer(gScene, eid, 0, 0, false);

                // turn off activate tag
                GA_Null_Component.isActivated[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Null = (eid: number, input: IInput) => {
    // 1. should never be blockers for null ability

    // 2. activate
    GA_Null_Component.isActivated[eid] = 1;

    // 3. success
    return true;
}

