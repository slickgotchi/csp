import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform";
import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { IInput } from "../../../../types/Input";


export const createGA_DashSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Dash]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Dash.isActivated[eid]) {

                // 3. activate
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }

                Transform.x[eid] += GA_Dash.dx[eid] * GA_Dash.distance[eid];
                Transform.y[eid] += GA_Dash.dy[eid] * GA_Dash.distance[eid];

                separateFromStaticColliders(eid, collidersByEid.get(eid));

                const finish = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }

                // tell room about our dash
                room.broadcast(Message.Player.Dash, {
                    serverEid: eid,
                    start: start,
                    finish: finish
                });

                // turn off activate tag
                GA_Dash.isActivated[eid] = 0;

                setTimeout(() => {
                    GA_Dash.isRunning[eid] = 0;
                }, 500);
            }
        })

        return world;
    })
}

export const tryActivateGA_Dash = (eid: number, input: IInput) => {
    // 1. check blockers

    // 2. activate
    GA_Dash.isActivated[eid] = 1;
    GA_Dash.isRunning[eid] = 1;
    GA_Dash.dx[eid] = input.dir.x;
    GA_Dash.dy[eid] = input.dir.y;
    GA_Dash.distance[eid] = 500;

    // 3. success
    return true;
}


