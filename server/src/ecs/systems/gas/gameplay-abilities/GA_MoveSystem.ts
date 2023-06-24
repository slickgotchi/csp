import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { GA_Move } from "../../../components/gas/gameplay-abilities/GA_Move";
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";
import { sPlayer } from "../../../../types/sPlayer";
import { Timer } from "../../../../utilities/Timer";


export const createGA_MoveSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Move]);

    const timer = new Timer();

    // update code
    return defineSystem((world: IWorld) => {
        timer.tick();

        onUpdate(world).forEach(eid => {

            // activae the move
            if (GA_Move.activated[eid]) {
                // 1. check no blocker abilities
                if (GA_RangedAttack.running[eid]) return;

                // 2. check ap & cooldown requirements met

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

                GA_Move.activated[eid] = 0;
            }
        });

        return world;
    })
}

export const tryActivateGA_Move = (eid: number, dx: number, dy: number) => {
    GA_Move.activated[eid] = 1;
    GA_Move.running[eid] = 1;
    GA_Move.dx[eid] = dx;
    GA_Move.dy[eid] = dy;
}


