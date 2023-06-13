import { Room } from "colyseus";
import { IGameState } from "../types/IGameState";
import { Schema } from '@colyseus/schema'
import * as Collisions from 'detect-collisions';
import { sEnemy } from "../types/sEnemy";
import { IWorld, addComponent, addEntity } from "bitecs";
import { Sync } from "../ecs/components/Sync";
import { createPfEnemy } from "../ecs/prefabs/pfEnemy";
import GameRoom from "./Game";
import { createPfASC_Enemy } from "../ecs/prefabs/gas/ability-system-components/pfASC_Enemy";

export const createEnemies = (room: GameRoom, world: IWorld, system: Collisions.System) => {
    for (let i = 0; i < 10; i++) {
        createPfASC_Enemy({
            room: room,
            world: world,
            system: system,
            x: Math.random()*1920,
            y: Math.random()*1080
        });
    }
}