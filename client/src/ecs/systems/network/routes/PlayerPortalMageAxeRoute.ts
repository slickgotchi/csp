import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessage_System";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { ASC_Player_Component } from "../../../componets/gas/ability-system-components/ASC_Player_Component";

const onUpdate = defineQuery([ASC_Player_Component]);

export const playerPortalMageAxeRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {

    })
}