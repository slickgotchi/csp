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
import { createInterpolateSystem } from "../ecs/systems/InterpolateSystem";
import { createPingSystem } from "../ecs/systems/PingSystem";
import * as Collisions from 'detect-collisions';
import { createCollisionsSystem } from "../ecs/systems/CollisionsSystem";

export const CSP = {
    isClientSidePrediction: false,
    isAuthoritativeServer: true,
    isServerReconciliation: false,
}


export class Game extends Phaser.Scene {
    private world!: IWorld;
    private systems: System[] = [];
    private collisionSystem!: Collisions.System;

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
        this.collisionSystem = new Collisions.System();

        // create server connection
        this.client = new Client('ws://localhost:8345');
        this.room = await this.client.joinOrCreate<IGameState & Schema>('game');

        // add key text
        this.add.circle(75, 175, 25, 0x00ff00);
        this.add.text(125, 175, "Client Side Prediction Player", {fontSize: "36px"})
            .setOrigin(0, 0.5);

        this.add.circle(75, 250, 25, 0x0F8A0F);
        this.add.text(125, 250, "Server Authoritative Player", {fontSize: "36px"})
            .setOrigin(0,0.5);

        // SYSTEMS
        // 1. process server messages
        this.systems.push(createServerMessageSystem(this.room, this.world, this, this.collisionSystem));

        // 2. process client inputs
        this.systems.push(createClientInputSystem(this, this.room));
        this.systems.push(createCollisionsSystem(this.collisionSystem));

        // 3. interpolation
        this.systems.push(createInterpolateSystem());

        // 4. render
        this.systems.push(createCircleSystem(this.world, this));
        this.systems.push(createPingSystem(this.room, this));
    }

    update() {
        // update systems
        this.systems.forEach(system => {
            system(this.world);
        });
    }
}