import { IWorld, addComponent, defineQuery, defineSystem, enterQuery, hasComponent } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { ArcBoxCollider, ArcCircleCollider, collidersByEid, rollbackColliders, separateFromStaticColliders, unRollbackColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import { GA_PortalMageAxe } from "../../../components/gas/gameplay-abilities/GA_PortalMageAxe";
import * as Collisions from 'detect-collisions';
import { ASC_Player } from "../../../components/gas/ability-system-components/ASC_Player";
import { ASC_Enemy } from "../../../components/gas/ability-system-components/ASC_Enemy";
import { IInput } from "../../../../types/Input";
import { sPlayer } from "../../../../types/sPlayer";
import { isActiveAbilities } from ".";

export const createGA_PortalMageAxeSystem = (room: GameRoom, collisions: Collisions.System) => {

    const onUpdate = defineQuery([GA_PortalMageAxe]);
    const onAdd = enterQuery(onUpdate);

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
            if (GA_PortalMageAxe.isActivated[eid]) {
                // 3. activate
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }
                Transform.x[eid] += GA_PortalMageAxe.dx[eid]*100;
                Transform.y[eid] += GA_PortalMageAxe.dy[eid]*100;

                separateFromStaticColliders(eid, collidersByEid.get(eid));

                const dir = {
                    x: GA_PortalMageAxe.dx[eid],
                    y: GA_PortalMageAxe.dy[eid]
                }
                
                // create hit collider and check for collisions
                const hitCollider = hitCollidersByEid.get(eid);
                const playerGo = room.state.gameObjects.get(eid.toString()) as sPlayer;
                if (hitCollider && playerGo) {
                    // 1. rollback colliders
                    const targetTime_ms = room.state.serverTime_ms - playerGo.meanPing_ms/2 - 300;
                    rollbackColliders(world, targetTime_ms);

                    // 2. set hitCollider position
                    hitCollider.setPosition(
                        start.x + dir.x*200,
                        start.y + dir.y*200
                    )

                    // 3. check collisions
                    const hitEnemies: any[] = [];
                    const hitPlayers: any[] = [];
                    checkCollisionsGA_PortalMageAxe(collisions, hitCollider, world, hitEnemies, hitPlayers);

                    // 4. unroll colliders
                    unRollbackColliders(world);

                    // 5. broadcast attack
                    room.broadcast(Message.Player.PortalMageAxe, {
                        serverEid: eid,
                        start: start,
                        dir: dir,
                        hitCollider: {
                            x: hitCollider?.x, y: hitCollider?.y,
                            radius: 200,
                            angle: hitCollider?.angle
                        },
                        hitEnemies: hitEnemies,
                        hitPlayers: hitPlayers,
                    })
                }

                // turn off activate tag
                GA_PortalMageAxe.isActivated[eid] = 0;

                setTimeout(() => {
                    GA_PortalMageAxe.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_PortalMageAxe = (eid: number, input: IInput) => {
    // 1. blockers
    if (isActiveAbilities(eid)) return false;
    
    // 2. activate
    GA_PortalMageAxe.isActivated[eid] = 1;
    GA_PortalMageAxe.isRunning[eid] = 1;
    GA_PortalMageAxe.dx[eid] = input.dir.x;
    GA_PortalMageAxe.dy[eid] = input.dir.y;

    // 3. success
}

// smol func to make some random damage
const calcDamage = () => {
    return ((Math.random()-0.5)*5 + 29).toFixed();
}

const checkCollisionsGA_PortalMageAxe = (collisions: Collisions.System, hitCollider: Collisions.Circle, world: IWorld, hitEnemies: any[], hitPlayers: any[]) => {
    collisions.checkOne(hitCollider, response => {
        const { b } = response;
        const goEid = (b as ArcCircleCollider).serverEid;

        if (hasComponent(world, ASC_Enemy, goEid)) {
            hitEnemies.push({
                serverEid: goEid,
                damage: calcDamage(),
            });
        }
        if (hasComponent(world, ASC_Player, goEid)) {
            hitPlayers.push({
                serverEid: goEid,
                damage: calcDamage(),
            })
        }
    })
}




