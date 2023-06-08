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

        // add key text
        this.add.circle(75, 175, 25, 0x00ff00);
        this.add.text(125, 175, "Client Side Prediction Player", {fontSize: "36px"})
            .setOrigin(0, 0.5);

        this.add.circle(75, 250, 25, 0x0F8A0F);
        this.add.text(125, 250, "Server Authoritative Player", {fontSize: "36px"})
            .setOrigin(0,0.5);

        // create collider rect
        this.add.rectangle( 1500,500, 200, 200, 0xff6666)
            .setOrigin(0,0);


        // SYSTEMS
        // 1. process server messages
        this.systems.push(createServerMessageSystem(this.room, this.world));

        // 2. process client inputs
        this.systems.push(createClientInputSystem(this, this.room));

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