import { Room } from "colyseus";
import { IGameState } from "../types/IGameState";
import { Schema, type } from "@colyseus/schema";
import { sPlayer } from "../types/sPlayer";
import { sRectangle } from "../types/sRectangle";
import * as Collisions from 'detect-collisions';



export const createPlayer = (room: Room<IGameState & Schema>, sessionId: string, system: Collisions.System) => {
    // player
    const go = new sPlayer({
        sessionId: sessionId,
        x: 1920/2,
        y: 1080/2,
    });

    // collider
    go.collider = system.createCircle(
        {x: go.pos.x, y: go.pos.y},
        50
    );

    // add to game objects
    room.state.gameObjects.push(go);
}