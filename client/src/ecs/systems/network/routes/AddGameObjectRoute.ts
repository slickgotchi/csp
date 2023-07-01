import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessage_System";
import { IWorld } from "bitecs";
import { sGameObject } from "../../../../../../server/src/types/sGameObject";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { sRectangle } from "../../../../../../server/src/types/sRectangle";
import { createASC_Player_Prefab } from "../../../prefabs/gas/ability-system-components/ASC_Player_Prefab";
import { createASC_Enemy_Prefab } from "../../../prefabs/gas/ability-system-components/ASC_Enemy_Prefab";
import { createASC_Obstacle_Prefab } from "../../../prefabs/gas/ability-system-components/ASC_Obstacle_Prefab";




export const addGameObjectRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    const goType = message.payload.type;
    const handler = (createPfRoutes as any)[goType];
    handler(room, world, message.payload);
}

const createPfPlayerRoute = (room: Room, world: IWorld, go: sGameObject) => {
    // if (room.sessionId === (go as sPlayer).sessionId) {
    //     createPfPlayerShadow({
    //         world: world,
    //         serverEid: go.serverEid,
    //         x: go.x,
    //         y: go.y,
    //     });
    // }

    createASC_Player_Prefab({
        room: room,
        world: world,
        sessionId: (go as sPlayer).sessionId,
        serverEid: go.serverEid,
        x: go.x,
        y: go.y,
    });
}

const createPfEnemyRoute = (room: Room, world: IWorld, go: sGameObject) => {
    createASC_Enemy_Prefab({
        world: world,
        serverEid: go.serverEid,
        x: go.x,
        y: go.y,
    })
}

const createPfRectangleRoute = (room: Room, world: IWorld, go: sGameObject) => {
    createASC_Obstacle_Prefab({
        world: world,
        serverEid: go.serverEid,
        x: go.x,
        y: go.y,
        width: (go as sRectangle).width,
        height: (go as sRectangle).height,
        color: 0x666666
    });
}


const createPfRoutes = {
    'player': createPfPlayerRoute,
    'enemy': createPfEnemyRoute,
    'rectangle': createPfRectangleRoute
}