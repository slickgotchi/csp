import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";
import { sPlayer } from "../../../../types/sPlayer";
import { Timer } from "../../../../utilities/Timer";
import { IInput } from "../../../../types/Input";
import { GA_Null } from "../../../components/gas/gameplay-abilities/GA_Null";


export const createGA_NullSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Null]);

    const timer = new Timer();

    // update code
    return defineSystem((world: IWorld) => {
        timer.tick();

        onUpdate(world).forEach(eid => {

            // activae the move
            if (GA_Null.isActivated[eid]) {

                (room.state.gameObjects.get(eid.toString()) as sPlayer).last_processed_input++;

                // 4. broadcast the move to players
                room.broadcast(Message.Player.Move, {
                    serverEid: eid,
                    x: Transform.x[eid],
                    y: Transform.y[eid],
                    serverTime_ms: room.state.serverTime_ms,
                    last_processed_input: (room.state.gameObjects.get(eid.toString()) as sPlayer).last_processed_input
                });

                GA_Null.isActivated[eid] = 0;
            }
        });

        return world;
    })
}

export const tryActivateGA_Null = (eid: number, input: IInput) => {
    // 1. should never be blockers for null
        
    // 2. activate
    GA_Null.isActivated[eid] = 1;

    // 3. success
    return true;
}


