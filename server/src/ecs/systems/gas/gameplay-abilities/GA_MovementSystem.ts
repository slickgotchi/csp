import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Client } from "colyseus";
import { sPlayer } from "../../../../types/sPlayer";
import { sGameObject } from "../../../../types/sGameObject";
import { Transform } from "../../../components/Transform";
import { IInput } from "../../../../types/Input";
import { GA_Movement } from "../../../components/gas/gameplay-abilities/GA_Movement";
import { Timer } from "../../../../utilities/Timer";
import { AT_Move } from "../../../components/gas/ability-tasks/AT_Move";


export const createGA_ClientInputMovementSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Movement]);

    const timer = new Timer();

    // update code
    return defineSystem((world: IWorld) => {
        timer.tick();

        return world;
    })
}

export const tryActivateGA_Move = (world: IWorld, eid: number, vx: number, vy: number, duration_ms: number) => {
    // 1. check for blockers

    // 3. activate
    addComponent(world, AT_Move, eid, false);
    AT_Move.duration_ms[eid] += duration_ms;
    AT_Move.vx[eid] = vx;
    AT_Move.vy[eid] = vy;
}

