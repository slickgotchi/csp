import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { GA_Move } from "../../../components/gas/gameplay-abilities/GA_Move";


export const createGA_MoveSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Move]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Move.tryActivate[eid]) {
                // 1. check no blocker abilities

                // 2. check ap & cooldown requirements met

                // 3. activate
                Transform.x[eid] += GA_Move.dx[eid];
                Transform.y[eid] += GA_Move.dy[eid];

                separateFromStaticColliders(eid, collidersByEid.get(eid));

                // turn off activate tag
                GA_Move.tryActivate[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Move = (eid: number, dx: number, dy: number) => {
    GA_Move.tryActivate[eid] = 1;
    GA_Move.dx[eid] = dx;
    GA_Move.dy[eid] = dy;
}


