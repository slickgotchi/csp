import { MapSchema, Schema, type } from "@colyseus/schema";
import { IGameState } from "../types/IGameState";
import { sGameObject } from "../types/sGameObject";

export default class GameState extends Schema implements IGameState {
    @type({map: sGameObject})
    gameObjects = new MapSchema<sGameObject>();

    @type('number')
    serverTime_ms = Date.now();
}