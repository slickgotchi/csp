import { IWorld, defineQuery, defineSystem, hasComponent } from "bitecs";
import * as Collisions from 'detect-collisions';
import { ArcCircleCollider, collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";
import { Enemy } from "../../../componets/Enemy";
import { tintFlash } from "../../server-message/routes/EnemyTakeDamageRoute";
import { Transform } from "../../../componets/Transform";
import { GA_PortalMageAxe } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe";
import { IInput } from "../../ClientPlayerInputSystem";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GameScene } from "../../../../scenes/GameScene";
import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { isActiveAbilities } from ".";

export const createGA_PortalMageAxeSystem = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_PortalMageAxe]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_PortalMageAxe.isActivated[eid]) {
                
                // 1. check collisions and play any enemy hit anims
                const start = { x: Transform.x[eid], y: Transform.y[eid], }
                const dir = { x: GA_PortalMageAxe.dx[eid]/100, y: GA_PortalMageAxe.dy[eid]/100 }
                playEnemyCollisionAnims(world, gScene.collisions, start, dir);

                // 2. move
                Transform.x[eid] += GA_PortalMageAxe.dx[eid];
                Transform.y[eid] += GA_PortalMageAxe.dy[eid];
                separateFromStaticColliders(eid, collidersByEid.get(eid));

                // 3. render attack anim
                playAnimGA_PortalMageAxe(gScene, world, eid, start, dir);

                // 3. activate done
                GA_PortalMageAxe.isActivated[eid] = 0;

                // 4. set a timeout on running
                setTimeout(() => {
                    GA_PortalMageAxe.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_PortalMageAxe = (eid: number, input: IInput) => {
    // 1. check ability blockers
    if (isActiveAbilities(eid)) return false;

    // 2. ok we can activate!
    GA_PortalMageAxe.isActivated[eid] = 1;
    GA_PortalMageAxe.isRunning[eid] = 1;
    GA_PortalMageAxe.dx[eid] = input.dir.x * 100;
    GA_PortalMageAxe.dy[eid] = input.dir.y * 100;

    // 3. success
    return true;
}

export const applyInputGA_PortalMageAxe = (eid: number, input: IInput) => {
    Transform.x[eid] += input.dir.x * 100;
    Transform.y[eid] += input.dir.y * 100;
    separateFromStaticColliders(eid, collidersByEid.get(eid));
}

export const playAnimGA_PortalMageAxe = (scene: Phaser.Scene, world: IWorld, eid: number, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    setTimeout(() => {
        ArcUtils.Draw.makeFadeCircle(
            scene,
            {
                x: start.x + dir.x*200,
                y: start.y + dir.y*200
            },
            150,
            0xffffff
        )
    }, 100);
}   


const playEnemyCollisionAnims = (world: IWorld, collisions: Collisions.System, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create a collider
    const hitCollider = collisions.createCircle(
        {x:0,y:0},
        150
    )

    // adjust hit collider pos/angle
    hitCollider.setPosition(start.x + dir.x*200, start.y + dir.y*200);

    // check collisions
    collisions.checkOne(hitCollider, response => {
        const { b } = response;
        const goEid = (b as ArcCircleCollider).eid;

        // do tint flashes if we got a hit
        if (hasComponent(world, Enemy, goEid)) {
            setTimeout(() => {
                tintFlash(goEid);
            }, 100)
        }
    })
}