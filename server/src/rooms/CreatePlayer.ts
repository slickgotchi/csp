import { Room } from "colyseus";
import { IGameState } from "../types/IGameState";
import { Schema, type } from "@colyseus/schema";
import { sPlayer } from "../types/sPlayer";
import { sRectangle } from "../types/sRectangle";
import * as Collisions from 'detect-collisions';
import { IWorld, addComponent, addEntity } from "bitecs";
import { Sync } from "../ecs/components/Sync";
import { createPfPlayer } from "../ecs/prefabs/pfPlayer";
import GameRoom from "./Game";



export const createPlayer = (room: GameRoom, world: IWorld, sessionId: string, system: Collisions.System) => {
    // player
    createPfPlayer({
        room: room,
        world: world,
        system: system,
        sessionId: sessionId,
        x: 1920/2,
        y: 1080/2
    });
}