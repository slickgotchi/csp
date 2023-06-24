import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { ping } from "../../PingSystem";
import { playMeleeAttackAnim } from "../../gas/gameplay-abilities/GA_MeleeAttackSystem";

const onUpdate = defineQuery([Player]);

export const playerMeleeAttackRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {
        if (!hasComponent(world, ClientPlayerInput, eid)) {
            if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
                setTimeout(() => {
                    playMeleeAttackAnim(
                        scene, 
                        world,
                        eid,
                        message.payload.start, 
                        message.payload.dir, 
                    );

                },ping/2 + 100 + 100)
            }
        }
    })
}