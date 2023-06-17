import { IWorld, addComponent, defineQuery, defineSystem, enterQuery } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { GA_MeleeAttack } from "../../../components/gas/gameplay-abilities/GA_MeleeAttack";
import * as Collisions from 'detect-collisions';

export const createGA_MeleeAttackSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_MeleeAttack]);
    const onAdd = enterQuery(onUpdate);

    const hitCollidersByEid = new Map<number, Collisions.Circle>();

    // update code
    return defineSystem((world: IWorld) => {


        onUpdate(world).forEach(eid => {
            if (GA_MeleeAttack.tryActivate[eid]) {
                // 1. check no blocker abilities

                // 2. check ap & cooldown requirements met
                
                // 3. activate
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }
                Transform.x[eid] += GA_MeleeAttack.dx[eid]*100;
                Transform.y[eid] += GA_MeleeAttack.dy[eid]*100;

                separateFromStaticColliders(eid, collidersByEid.get(eid));

                const dir = {
                    x: GA_MeleeAttack.dx[eid],
                    y: GA_MeleeAttack.dy[eid]
                }
                
                // check collisions

                // broadcast
                room.broadcast(Message.Player.MeleeAttack, {
                    serverEid: eid,
                    start: start,
                    dir: dir
                })

                // turn off activate tag
                GA_MeleeAttack.tryActivate[eid] = 0;
            }
        })

        return world;
    })
}

export const tryActivateGA_MeleeAttack = (eid: number, dx: number, dy: number) => {
    GA_MeleeAttack.tryActivate[eid] = 1;
    GA_MeleeAttack.dx[eid] = dx;
    GA_MeleeAttack.dy[eid] = dy;
}


