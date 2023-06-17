import { IWorld, addComponent, defineQuery, defineSystem, enterQuery } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import * as Collisions from 'detect-collisions';
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";

export const createGA_RangedAttackSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_RangedAttack]);
    const onAdd = enterQuery(onUpdate);

    const hitCollidersByEid = new Map<number, Collisions.Circle>();

    // update code
    return defineSystem((world: IWorld) => {


        onUpdate(world).forEach(eid => {
            if (GA_RangedAttack.tryActivate[eid]) {
                // 1. check no blocker abilities

                // 2. check ap & cooldown requirements met
                
                // 3. activate
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }

                // separateFromStaticColliders(eid, collidersByEid.get(eid));

                const dir = {
                    x: GA_RangedAttack.dx[eid],
                    y: GA_RangedAttack.dy[eid]
                }
                
                // check collisions

                // broadcast
                room.broadcast(Message.Player.RangedAttack, {
                    serverEid: eid,
                    start: start,
                    dir: dir
                })

                // turn off activate tag
                GA_RangedAttack.tryActivate[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_RangedAttack = (eid: number, dx: number, dy: number) => {
    GA_RangedAttack.tryActivate[eid] = 1;
    GA_RangedAttack.dx[eid] = dx;
    GA_RangedAttack.dy[eid] = dy;
}


