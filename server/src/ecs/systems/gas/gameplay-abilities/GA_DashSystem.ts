import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Client } from "colyseus";
import { sPlayer } from "../../../../types/sPlayer";
import { sGameObject } from "../../../../types/sGameObject";
import { Transform } from "../../../components/Transform";
import { IInput } from "../../../../types/Input";
import { GA_Movement } from "../../../components/gas/gameplay-abilities/GA_Movement";
import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";


export const createGA_DashSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Dash]);

    // update code
    return defineSystem((world: IWorld) => {
        onUpdate(world).forEach(eid => {
            if (GA_Dash.tryActivate[eid]) {
                // 1. check no blocker abilities

                // 2. check ap & cooldown requirements met

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
                room.broadcast(Message.PlayerDash, {
                    serverEid: eid,
                    start: start,
                    finish: finish
                });

                // turn off activate tag
                GA_Dash.tryActivate[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_Dash = (eid: number, dx: number, dy: number, distance: number) => {
    GA_Dash.tryActivate[eid] = 1;
    GA_Dash.dx[eid] = dx;
    GA_Dash.dy[eid] = dy;
    GA_Dash.distance[eid] = distance;
}


