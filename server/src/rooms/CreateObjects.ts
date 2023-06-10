import { Room } from "colyseus";
import { IGameState } from "../types/IGameState";
import { Schema, type } from "@colyseus/schema";
import { sPlayer } from "../types/sPlayer";
import { sRectangle } from "../types/sRectangle";
import * as Collisions from 'detect-collisions';


export const createObjects = (room: Room<IGameState & Schema>, system: Collisions.System) => {
    // rectangle
    let go = new sRectangle({
        x: 100,
        y: 500,
        width: 100,
        height: 300
    });
    go.collider = system.createBox(
        {x: go.pos.x, y: go.pos.y},
        go.width,
        go.height
    )
    room.state.gameObjects.push(go);

    // rectangle
    go = new sRectangle({
        x: 1500,
        y: 500,
        width: 200,
        height: 300
    });
    go.collider = system.createBox(
        {x: go.pos.x, y: go.pos.y},
        go.width,
        go.height
    )
    room.state.gameObjects.push(go);

    // rectangle
    go = new sRectangle({
        x: 200,
        y: 900,
        width: 100,
        height: 500
    });
    go.collider = system.createBox(
        {x: go.pos.x, y: go.pos.y},
        go.width,
        go.height
    )
    room.state.gameObjects.push(go);
}