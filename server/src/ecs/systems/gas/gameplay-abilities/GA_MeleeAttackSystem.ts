import { IWorld, addComponent, defineQuery, defineSystem, enterQuery, hasComponent } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { ArcBoxCollider, ArcCircleCollider, collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { GA_MeleeAttack } from "../../../components/gas/gameplay-abilities/GA_MeleeAttack";
import * as Collisions from 'detect-collisions';
import { ASC_Player } from "../../../components/gas/ability-system-components/ASC_Player";
import { ASC_Enemy } from "../../../components/gas/ability-system-components/ASC_Enemy";

export const createGA_MeleeAttackSystem = (room: GameRoom, collisions: Collisions.System) => {

    const onUpdate = defineQuery([GA_MeleeAttack]);
    const onAdd = enterQuery(onUpdate);

    const onPlayer = defineQuery([ASC_Player]);
    const onEnemy = defineQuery([ASC_Enemy]);

    const hitCollidersByEid = new Map<number, Collisions.Circle>();

    // update code
    return defineSystem((world: IWorld) => {
        onAdd(world).forEach(eid => {
            const hitCollider = collisions.createCircle(
                {x: 0, y: 0},
                150
            );
            hitCollidersByEid.set(eid, hitCollider);
        })

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
                
                // check collisions with enemies and players
                const hitCollider = hitCollidersByEid.get(eid);
                if (hitCollider) {
                    hitCollider.setPosition(
                        start.x + dir.x*200,
                        start.y + dir.y*200
                    )

                    collisions.checkOne(hitCollider, response => {
                        const { b } = response;
                        const goEid = (b as ArcCircleCollider).serverEid;
                        if (hasComponent(world, ASC_Enemy, goEid)) {
                            room.broadcast(Message.Enemy.TakeDamage, {
                                serverEid: goEid,
                                x: Transform.x[goEid],
                                y: Transform.y[goEid],
                                damage: 100,
                            })
                        }
                        if (hasComponent(world, ASC_Player, goEid) && goEid !== eid) {
                            room.broadcast(Message.Player.TakeDamage, {
                                serverEid: goEid,
                                x: Transform.x[goEid],
                                y: Transform.y[goEid],
                                damage: 100,
                            })
                        }
                    });
                }

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




