import { Room } from "colyseus";
import { IGameState } from "../types/IGameState";
import { Schema, type } from "@colyseus/schema";
import { sPlayer } from "../types/sPlayer";
import { sRectangle } from "../types/sRectangle";
import * as Collisions from 'detect-collisions';
import { IWorld, addComponent, addEntity } from "bitecs";
import { Sync } from "../ecs/components/Sync";
import { createPfRectangle } from "../ecs/prefabs/pfRectangle";
import GameRoom from "./Game";


export const createRectangles = (room: GameRoom, world: IWorld, system: Collisions.System) => {
    // rectangle
    createPfRectangle({
        room: room,
        world: world,
        system: system,
        x: 100,
        y: 500,
        width: 100,
        height: 300
    })

    createPfRectangle({
        room: room,
        world: world,
        system: system,
        x: 1500,
        y: 500,
        width: 200,
        height: 300
    })

    createPfRectangle({
        room: room,
        world: world,
        system: system,
        x: 200,
        y: 900,
        width: 1000,
        height: 200
    })
}