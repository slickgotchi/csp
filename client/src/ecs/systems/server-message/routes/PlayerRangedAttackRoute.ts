import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { playDashAnim, playMeleeAttackAnim, playRangedAttackAnim } from "../../ClientPlayerInputSystem";
import { ping } from "../../PingSystem";
import * as Collisions from 'detect-collisions';

const onUpdate = defineQuery([Player]);

export const playerRangedAttackRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {
        if (!hasComponent(world, ClientPlayerInput, eid)) {
            // 
            if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
                setTimeout(() => {
                    playRangedAttackAnim(
                        scene, 
                        message.payload.start, 
                        message.payload.dir, 
                    );

                },ping/2 + 100 + 100)

            }
            // showCollider(scene, message.payload.hitCollider);
        }
    })
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