import { Room } from "colyseus";
import { IGameState } from "../types/IGameState";
import { Schema, type } from "@colyseus/schema";
import { sPlayer } from "../types/sPlayer";
import { sRectangle } from "../types/sRectangle";



export const createObjects = (room: Room<IGameState & Schema>) => {
    // player
    room.state.gameObjects.push(new sPlayer({
        x: 1920/2,
        y: 1080/2,
    }));

    // rectangle
    room.state.gameObjects.push(new sRectangle({
        x: 100,
        y: 500,
        width: 100,
        height: 300
    }));

    // rectangle
    room.state.gameObjects.push(new sRectangle({
        x: 1500,
        y: 500,
        width: 200,
        height: 200
    }));

    // rectangle
    room.state.gameObjects.push(new sRectangle({
        x: 200,
        y: 900,
        width: 1200,
        height: 200
    }));
}