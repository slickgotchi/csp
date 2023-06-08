import { ArraySchema, Schema, type } from "@colyseus/schema";
import { IGameState } from "../types/IGameState";
import { sGameObject } from "../types/sGameObject";

export default class GameState extends Schema implements IGameState {
    @type([sGameObject])
    gameObjects = new ArraySchema<sGameObject>();
}