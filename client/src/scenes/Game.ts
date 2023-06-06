import { IWorld, System, createWorld } from "bitecs";
import * as Phaser from "phaser";
import { createCircleSystem } from "../ecs/systems/CircleSystem";
import { createPfPlayer } from "../ecs/prefabs/pfPlayer";
import { createClientInputSystem } from "../ecs/systems/ClientInputSystem";
import { Client, Room } from 'colyseus.js';
import { Schema } from "@colyseus/schema";
import { IGameState } from '../../../server/src/types/IGameState';
import { createServerMessageSystem } from "../ecs/systems/ServerMessageSystem";
import { createPfPlayerShadow } from "../ecs/prefabs/pfPlayerShadow";

export const CSP = {
    isClientSidePrediction: false,
    isAuthoritativeServer: true,
    isServerReconciliation: false,
}


export class Game extends Phaser.Scene {
    private world!: IWorld;
    private systems: System[] = [];

    // server connections
    private client!: Client;
    private room!: Room<IGameState & Schema>;

    constructor() {
        super('game');
    }

    init() {
        
    }

    async create() {
        // create bitecs world
        this.world = createWorld();

        // create server connection
        this.client = new Client('ws://localhost:8345');
        this.room = await this.client.joinOrCreate<IGameState & Schema>('game');

        // create prefabs
        createPfPlayerShadow({
            world: this.world,
            x: 1000,
            y: 500,
        });

        createPfPlayer({
            world: this.world,
            x: 1000,
            y: 500,
        });


        // SYSTEMS
        // 1. process server messages
        this.systems.push(createServerMessageSystem(this.room, this.world));

        // 2. process client inputs
        this.systems.push(createClientInputSystem(this, this.room));

        // 3. interpolation

        // 4. render
        this.systems.push(createCircleSystem(this.world, this));
    }

    update() {
        // update systems
        this.systems.forEach(system => {
            system(this.world);
        });
    }
}