import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld } from "bitecs";
import { sGameObject } from "../../../../../../server/src/types/sGameObject";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { createPfPlayerShadow } from "../../../prefabs/pfPlayerShadow";
import { createPfPlayer } from "../../../prefabs/pfPlayer";
import { createPfEnemy } from "../../../prefabs/pfEnemy";
import { createPfObstacle } from "../../../prefabs/pfObstacle";
import { sRectangle } from "../../../../../../server/src/types/sRectangle";




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
    console.log('create player');

    createPfPlayer({
        room: room,
        world: world,
        sessionId: (go as sPlayer).sessionId,
        serverEid: go.serverEid,
        x: go.x,
        y: go.y,
    });
}

const createPfEnemyRoute = (room: Room, world: IWorld, go: sGameObject) => {
    createPfEnemy({
        world: world,
        serverEid: go.serverEid,
        x: go.x,
        y: go.y,
    })
}

const createPfRectangleRoute = (room: Room, world: IWorld, go: sGameObject) => {
    createPfObstacle({
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