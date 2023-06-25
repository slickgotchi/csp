import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { GA_Move } from "../../../components/gas/gameplay-abilities/GA_Move";
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";
import { sPlayer } from "../../../../types/sPlayer";
import { Timer } from "../../../../utilities/Timer";
import { IInput } from "../../../../types/Input";
import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { GA_MeleeAttack } from "../../../components/gas/gameplay-abilities/GA_MeleeAttack";


export const createGA_MoveSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Move]);

    const timer = new Timer();

    // update code
    return defineSystem((world: IWorld) => {
        timer.tick();

        onUpdate(world).forEach(eid => {

            // activae the move
            if (GA_Move.isActivated[eid]) {


                // 3. activate
                Transform.x[eid] += GA_Move.dx[eid];
                Transform.y[eid] += GA_Move.dy[eid];

                separateFromStaticColliders(eid, collidersByEid.get(eid));

                // 4. broadcast the move to players
                room.broadcast(Message.Player.Move, {
                    serverEid: eid,
                    x: Transform.x[eid],
                    y: Transform.y[eid],
                    serverTime_ms: room.state.serverTime_ms,
                    last_processed_input: (room.state.gameObjects.get(eid.toString()) as sPlayer).last_processed_input
                });

                GA_Move.isActivated[eid] = 0;
            }
        });

        return world;
    })
}

export const tryActivateGA_Move = (eid: number, input: IInput) => {
    // 1. check blockers
    if (GA_Dash.isRunning[eid]) return false;
    if (GA_RangedAttack.isRunning[eid]) return false;
    if (GA_MeleeAttack.isRunning[eid]) return false;
    
    // 2. activate
    GA_Move.isActivated[eid] = 1;
    GA_Move.isRunning[eid] = 1;
    GA_Move.dx[eid] = input.dir.x * 400 * input.dt_ms * 0.001;
    GA_Move.dy[eid] = input.dir.y * 400 * input.dt_ms * 0.001;

    // 3. success
    return true;
}


