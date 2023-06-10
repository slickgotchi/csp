import { Schema, MapSchema, type } from "@colyseus/schema";
import { sGameObject } from "./sGameObject";

export interface IGameState {
    gameObjects: MapSchema<sGameObject>;
}