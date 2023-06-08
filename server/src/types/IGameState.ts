import { Schema, ArraySchema, type } from "@colyseus/schema";
import { sGameObject } from "./sGameObject";

export interface IGameState {
    gameObjects: ArraySchema<sGameObject>;
}