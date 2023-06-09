import { Room } from "colyseus";
import { IGameState } from "../types/IGameState";
import { Schema, type } from "@colyseus/schema";
import { sPlayer } from "../types/sPlayer";
import { sRectangle } from "../types/sRectangle";
import * as Collisions from 'detect-collisions';
import { IWorld, addComponent, addEntity } from "bitecs";
import GameRoom from "./Game";
import { createPfObstacle } from "../ecs/prefabs/pfObstacle";


export const createObstacles = (room: GameRoom, world: IWorld, system: Collisions.System) => {
    // rectangle
    createPfObstacle({
        room: room,
        world: world,
        system: system,
        x: 350,
        y: 600,
        width: 100,
        height: 300
    })

    createPfObstacle({
        room: room,
        world: world,
        system: system,
        x: 1500,
        y: 200,
        width: 300,
        height: 200
    })

    createPfObstacle({
        room: room,
        world: world,
        system: system,
        x: 200,
        y: 300,
        width: 300,
        height: 200
    });


    // left wall
    createPfObstacle({
        room: room,
        world: world,
        system: system,
        x: -50,
        y: -50,
        width: 100,
        height: 1200
    });

    // right wall
    createPfObstacle({
        room: room,
        world: world,
        system: system,
        x: 1870,
        y: -50,
        width: 100,
        height: 1200
    });

    // top wall
    createPfObstacle({
        room: room,
        world: world,
        system: system,
        x: -50,
        y: -50,
        width: 2000,
        height: 100
    });

    // bottom wall
    createPfObstacle({
        room: room,
        world: world,
        system: system,
        x: -50,
        y: 1030,
        width: 2000,
        height: 100
    });
}