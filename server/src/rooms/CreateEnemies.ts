
import * as Collisions from 'detect-collisions';
import { IWorld, addComponent, addEntity } from "bitecs";
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