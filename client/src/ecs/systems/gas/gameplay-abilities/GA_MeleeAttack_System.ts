import { IWorld, defineQuery, defineSystem, hasComponent } from "bitecs";
import { tintFlash } from "../../network/routes/EnemyTakeDamageRoute";
import { IInput, movePlayer, GameScene } from "../../../../internalExports";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { isActiveAbilities } from ".";
import { GA_MeleeAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_MeleeAttack_Component";
import { ArcCircleCollider } from "../../collisions/Collider_System";
import { ASC_Enemy_Component } from "../../../componets/gas/ability-system-components/ASC_Enemy_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";

export const createGA_MeleeAttack_System = (gScene: GameScene) => {

    const onUpdate = defineQuery([GA_MeleeAttack_Component]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_MeleeAttack_Component.isActivated[eid]) {
                
                // 1. check collisions and play any enemy hit anims
                const start = { x: Transform_Component.x[eid], y: Transform_Component.y[eid], }
                const dir = { x: GA_MeleeAttack_Component.dx[eid]/100, y: GA_MeleeAttack_Component.dy[eid]/100 }

                // 2. move
                movePlayer(gScene, eid, GA_MeleeAttack_Component.dx[eid], GA_MeleeAttack_Component.dy[eid]);

                // 3. render attack anim
                playAnimGA_MeleeAttack(gScene, world, eid, start, dir);

                // 3. activate done
                GA_MeleeAttack_Component.isActivated[eid] = 0;

                // 4. set a timeout on running
                setTimeout(() => {
                    GA_MeleeAttack_Component.isRunning[eid] = 0;
                }, 250);
            }
        })

        return world;
    })
}

export const tryActivateGA_MeleeAttack = (eid: number, input: IInput) => {
    // 1. check ability blockers
    if (isActiveAbilities(eid)) return false;

    // 2. ok we can activate!
    GA_MeleeAttack_Component.isActivated[eid] = 1;
    GA_MeleeAttack_Component.isRunning[eid] = 1;
    GA_MeleeAttack_Component.dx[eid] = input.dir.x * 100;
    GA_MeleeAttack_Component.dy[eid] = input.dir.y * 100;

    // 3. success
    return true;
}

export const playAnimGA_MeleeAttack = (gScene: GameScene, world: IWorld, eid: number, start: {x:number,y:number}, dir: {x:number,y:number}, enemyFlash: boolean = true) => {
    setTimeout(() => {
        ArcUtils.Draw.makeFadeCircle(
            gScene,
            {
                x: start.x + dir.x*200,
                y: start.y + dir.y*200
            },
            150,
            0xffffff
        )
    }, 100);

    if (enemyFlash) {
        // create a collider
        const hitCollider = gScene.collisions.createCircle(
            {x:0,y:0},
            150
        )

        // adjust hit collider pos/angle
        hitCollider.setPosition(start.x + dir.x*200, start.y + dir.y*200);

        // check collisions
        gScene.collisions.checkOne(hitCollider, response => {
            const { b } = response;
            const goEid = (b as ArcCircleCollider).eid;

            // do tint flashes if we got a hit
            if (hasComponent(world, ASC_Enemy_Component, goEid)) {
                setTimeout(() => {
                    tintFlash(goEid);
                }, 100)
            }
        })
    }
}   