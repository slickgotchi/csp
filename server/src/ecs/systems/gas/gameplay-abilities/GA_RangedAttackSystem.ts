import { IWorld, addComponent, defineQuery, defineSystem, enterQuery, hasComponent } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Transform } from "../../../components/Transform"
import { ArcBoxCollider, ArcCircleCollider, collidersByEid, rollbackCollider, rollbackColliders, separateFromStaticColliders, unRollbackCollider, unRollbackColliders } from "../../collisions/ColliderSystem";
import { Message } from "../../../../types/Messages";
import * as Collisions from 'detect-collisions';
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { ASC_Enemy } from "../../../components/gas/ability-system-components/ASC_Enemy";
import { ASC_Player } from "../../../components/gas/ability-system-components/ASC_Player";
import { sPlayer } from "../../../../types/sPlayer";
import { IInput } from "../../../../types/Input";

let counter = 0;

export const createGA_RangedAttackSystem = (room: GameRoom, collisions: Collisions.System) => {

    const onUpdate = defineQuery([GA_RangedAttack]);
    const onAdd = enterQuery(onUpdate);

    const hitCollidersByEid = new Map<number, Collisions.Box>();

    const WIDTH = 1000;
    const HEIGHT = 70;

    // update code
    return defineSystem((world: IWorld) => {

        onAdd(world).forEach(eid => {
            const box = collisions.createBox(
                {x:0,y:0},
                WIDTH,
                HEIGHT
            );
            box.isCentered = true;
            box.isStatic = false;
            hitCollidersByEid.set(eid, box); 
        })

        onUpdate(world).forEach(eid => {
            if (GA_RangedAttack.isActivated[eid]) {
                // 1. check no blocker abilities

                // 2. check ap & cooldown requirements met
                
                // 3. activate
                const start = {
                    x: Transform.x[eid],
                    y: Transform.y[eid]
                }

                const dir = {
                    x: GA_RangedAttack.dx[eid],
                    y: GA_RangedAttack.dy[eid]
                }
                
                // check collisions
                const hitCollider = hitCollidersByEid.get(eid);
                const playerGo = room.state.gameObjects.get(eid.toString()) as sPlayer;
                if (hitCollider && playerGo) {
                    // roll back colliders
                    const targetTime_ms = room.state.serverTime_ms - playerGo.meanPing_ms/2 - 300;
                    rollbackColliders(world, targetTime_ms);
                    
                    // adjust hit collider pos/angle
                    hitCollider.setPosition(start.x + dir.x*WIDTH/2, start.y + dir.y*WIDTH/2);
                    hitCollider.setAngle(Collisions.deg2rad(ArcUtils.Angle.fromVector2(dir)));
                    collisions.insert(hitCollider); // need this to update bbox for hit collider

                    // store any hit enemies/players
                    const hitEnemies: any[] = [];
                    const hitPlayers: any[] = [];

                    // check collisions
                    checkCollisionsGA_RangedAttack(collisions, hitCollider, world, hitEnemies, hitPlayers);

                    // unroll colliders
                    unRollbackColliders(world);

                    // broadcast
                    room.broadcast(Message.Player.RangedAttack, {
                        serverEid: eid,
                        start: start,
                        dir: dir,
                        hitCollider: {
                            x: hitCollider?.x, y: hitCollider?.y,
                            width: hitCollider?.width, height: hitCollider?.height,
                            angle: hitCollider?.angle
                        },
                        hitEnemies: hitEnemies,
                        hitPlayers: hitPlayers,
                    })
                } 


                // turn off activate tag
                GA_RangedAttack.isActivated[eid] = 0;

                // set timeout on running tag
                setTimeout(() => {
                    GA_RangedAttack.isRunning[eid] = 0;
                }, 250)
            }
        })

        return world;
    })
}

export const tryActivateGA_RangedAttack = (eid: number, input: IInput) => {
    // 1. check blockers
    
    GA_RangedAttack.isActivated[eid] = 1;
    GA_RangedAttack.isRunning[eid] = 1;
    GA_RangedAttack.dx[eid] = input.dir.x;
    GA_RangedAttack.dy[eid] = input.dir.y;
}

// smol func to make some random damage
const calcDamage = () => {
    return ((Math.random()-0.5)*5 + 24).toFixed();
}

const checkCollisionsGA_RangedAttack = (collisions: Collisions.System, hitCollider: Collisions.Box, world: IWorld, hitEnemies: any[], hitPlayers: any[]) => {
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


