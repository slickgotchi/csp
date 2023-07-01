import { IWorld, defineQuery, defineSystem } from "bitecs"
import { IInput, movePlayer } from "../../input/ClientPlayerInput_System";
import { GameScene } from "../../../../scenes/GameScene";
import { isActiveAbilities } from ".";
import { GA_Move_Component } from "../../../componets/gas/gameplay-abillities/GA_Move_Component";


export const createGA_Move_System = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_Move_Component]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Move_Component.isActivated[eid]) {

                // move player
                movePlayer(gScene, eid, GA_Move_Component.dx[eid], GA_Move_Component.dy[eid]);

                // turn off activate tag
                GA_Move_Component.isActivated[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Move = (eid: number, input: IInput) => {
    // 1. check blockers
    if (isActiveAbilities(eid)) return false;
    
    // 2. activate
    GA_Move_Component.isActivated[eid] = 1;
    GA_Move_Component.dx[eid] = input.dir.x * 400 * 0.1;
    GA_Move_Component.dy[eid] = input.dir.y * 400 * 0.1;

    // 3. success
    return true;
}


