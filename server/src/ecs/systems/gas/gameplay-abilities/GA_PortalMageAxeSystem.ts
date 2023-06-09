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
import { isActiveAbilities, movePlayer } from ".";
import { ArcUtils } from "../../../../utilities/ArcUtils";


export const createGA_PortalMageAxeSystem = (room: GameRoom, collisions: Collisions.System) => {

    const onUpdate = defineQuery([GA_PortalMageAxe]);
    const onAdd = enterQuery(onUpdate);

    const hitCollidersByEid = new Map<number, Collisions.Polygon>();

    // update code
    return defineSystem((world: IWorld) => {
        onAdd(world).forEach(eid => {
            const points = ArcUtils.Shape.createSectorPoints({x:0,y:0}, {x:0,y:1}, 60, 500, 4);
            const hitCollider = collisions.createPolygon(
                {x: 0, y: 0},
                points
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

                // separateFromStaticColliders(eid, collidersByEid.get(eid));

                const dir = {
                    x: GA_PortalMageAxe.dx[eid],
                    y: GA_PortalMageAxe.dy[eid]
                }
                
                // get hit collider and check for collisions
                // const points = ArcUtils.Shape.createSectorPoints(start, dir, 60, 500, 4);
                // const hitCollider = collisions.createPolygon({x:0,y:0}, points);
                const playerGo = room.state.gameObjects.get(eid.toString()) as sPlayer;
                if (playerGo) {
                    // 1. rollback colliders
                    const targetTime_ms = room.state.serverTime_ms - playerGo.meanPing_ms/2 - 300;
                    rollbackColliders(world, targetTime_ms);

                    // 2. find nearest eid
                    const nearestEid = getNearestHitEid(world, collisions, start, dir);
                    const nearestCollider = collidersByEid.get(nearestEid);
                    if (nearestEid && nearestCollider) {
                        const enemyPos = {
                            x: nearestCollider.x,
                            y: nearestCollider.y
                        }
                        let dir = {
                            x: enemyPos.x - start.x,
                            y: enemyPos.y - start.y
                        }
                        dir = ArcUtils.Vector2.normalise(dir);
    
                        const newPos = {
                            x: enemyPos.x - dir.x*90,
                            y: enemyPos.y - dir.y*90,
                        }
                        
                        // move player
                        movePlayer(room, eid, newPos.x - start.x, newPos.y - start.y);
                    }

                    // 3. check collisions
                    // const hitEnemies: any[] = [];
                    // const hitPlayers: any[] = [];
                    // checkCollisionsGA_PortalMageAxe(collisions, hitCollider, world, hitEnemies, hitPlayers);

                    // 4. unroll colliders
                    unRollbackColliders(world);

                    // 5. broadcast attack
                    room.broadcast(Message.Player.PortalMageAxe, {
                        serverEid: eid,
                        start: start,
                        dir: dir,
                        // hitColliderBbox: hitCollider.bbox,
                        // hitEnemies: hitEnemies,
                        // hitPlayers: hitPlayers,
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

const checkCollisionsGA_PortalMageAxe = (collisions: Collisions.System, hitCollider: Collisions.Polygon, world: IWorld, hitEnemies: any[], hitPlayers: any[]) => {
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

const getNearestHitEid = (world: IWorld, collisions: Collisions.System, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create a collider
    // const points = createSectorColliderPoints(start, dir);
    // const hitCollider = collisions.createPolygon( {x:0, y:0}, points );

    const points = ArcUtils.Shape.createSectorPoints(start, dir, 60, 500, 4);
    const hitCollider = collisions.createPolygon({x:0,y:0}, points);

    // check collision
    let nearestEid = 0;
    let closestDist = 1e9;
    collisions.checkOne(hitCollider, response => {
        const { b } = response;
        const goEid = (b as ArcCircleCollider).serverEid;

        // do tint flashes if we got a hit
        if (hasComponent(world, ASC_Enemy, goEid)) {
            // get location
            const enemyPos = {
                x: Transform.x[goEid],
                y: Transform.y[goEid],
            }

            const dist = ArcUtils.Vector2.distance(start, enemyPos);
            if (dist < closestDist) {
                nearestEid = goEid;
                closestDist = dist;
            }
        }
    });

    return nearestEid;
}



