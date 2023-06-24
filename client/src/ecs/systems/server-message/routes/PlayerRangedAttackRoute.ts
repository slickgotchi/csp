import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { ping } from "../../PingSystem";
import * as Collisions from 'detect-collisions';
import { Enemy } from "../../../componets/Enemy";
import { createDamagePopup, tintFlash } from "./EnemyTakeDamageRoute";
import { Transform } from "../../../componets/Transform";
import { Interpolate } from "../../../componets/Interpolate";
import { saveBuffer, setLastPositionBufferByEid } from "../../InterpolateSystem";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { playRangedAttackAnim } from "../../gas/gameplay-abilities/GA_RangedAttackSystem";
import { getEidFromServerEid } from ".";




export const playerRangedAttackRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    const playerEid = getEidFromServerEid(world, message.payload.serverEid);
    if (playerEid) {
        // ignore players with ClientPlayerInput as they do the anim separately
        if (!hasComponent(world, ClientPlayerInput, playerEid)) {

            // try activate ranged attack

            // recalc path slightly so shot looks like it comes from player
            const start = {
                x: Interpolate.x[playerEid],
                y: Interpolate.y[playerEid]
            }

            const end = {
                x: message.payload.start.x + message.payload.dir.x * 1000,
                y: message.payload.start.y + message.payload.dir.y * 1000
            }

            let dir = {
                x: end.x - start.x,
                y: end.y - start.y
            }

            dir = ArcUtils.Vector2.normalise(dir);
            
            // play ranged attack
            playRangedAttackAnim(
                scene, 
                world,
                playerEid,
                start,
                dir
            );

            // go through hit enemies
            message.payload.hitEnemies.forEach((he: any) => {
                const enemEid = getEidFromServerEid(world, he.serverEid);
                if (enemEid) {
                    setTimeout(() => {tintFlash(enemEid);}, 100);
                    setTimeout(() => {
                        createDamagePopup(scene, he.damage, Transform.x[enemEid], Transform.y[enemEid]-25)
                    }, 300);
                    
                }
            });
        } else {
            // go through hit enemies
            message.payload.hitEnemies.forEach((he: any) => {
                const enemEid = getEidFromServerEid(world, he.serverEid);
                if (enemEid) {
                    setTimeout(() => {tintFlash(enemEid);}, 100);
                    setTimeout(() => {
                        createDamagePopup(scene, he.damage, Interpolate.x[enemEid], Interpolate.y[enemEid]-25)
                    }, 0);
                    
                }
            });
        }
    }
    
}

const showCollider = (scene: Phaser.Scene, hitCollider: Collisions.Box) => {
    console.log(hitCollider);
    if (!hitCollider) return;

    const rect = scene.add.rectangle(
        hitCollider.x,
        hitCollider.y,
        hitCollider.width,
        hitCollider.height,
        0xffffff
    )
    rect.setAlpha(0.5);
    rect.setRotation(hitCollider.angle);

    scene.add.tween({
        targets: rect,
        alpha: 0,
        duration: 2500,
        onComplete: () => {
            rect.destroy();
        }
    })
}