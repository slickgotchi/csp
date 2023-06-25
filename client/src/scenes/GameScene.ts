import { IWorld, System, addEntity, createWorld } from "bitecs";
import * as Phaser from "phaser";
import { createCircleSystem } from "../ecs/systems/CircleSystem";
import { createClientPlayerInputSystem } from "../ecs/systems/ClientPlayerInputSystem";
import { Client, Room } from 'colyseus.js';
import { Schema } from "@colyseus/schema";
import { IGameState } from '../../../server/src/types/IGameState';
import { createServerMessageSystem } from "../ecs/systems/server-message/ServerMessageSystem";
import { createInterpolateSystem } from "../ecs/systems/InterpolateSystem";
import { createPingSystem } from "../ecs/systems/PingSystem";
import * as Collisions from 'detect-collisions';
import { createRectangleSystem } from "../ecs/systems/RectangleSystem";
import { createColliderSystem } from "../ecs/systems/collisions/ColliderSystem";
import { createGA_RangedAttackSystem } from "../ecs/systems/gas/gameplay-abilities/GA_RangedAttackSystem";
import { createGA_MeleeAttackSystem } from "../ecs/systems/gas/gameplay-abilities/GA_MeleeAttackSystem";
import { createGA_MoveSystem } from "../ecs/systems/gas/gameplay-abilities/GA_MoveSystem";
import { createGA_DashSystem } from "../ecs/systems/gas/gameplay-abilities/GA_DashSystem";
import { createGA_NullSystem } from "../ecs/systems/gas/gameplay-abilities/GA_NullSystem";

export class GameScene extends Phaser.Scene {
    world!: IWorld;
    private systems: System[] = [];
    collisions!: Collisions.System;

    // server connections
    private client!: Client;
    room!: Room<IGameState & Schema>;

    constructor() {
        super('game');
    }

    init() {
        
    }

    async create() {
        // create bitecs world
        this.world = createWorld();
        addEntity(this.world);  // to set the permanent 0 entity eid
        this.collisions = new Collisions.System();

        // create server connection
        this.client = new Client('ws://localhost:8345');
        this.room = await this.client.joinOrCreate<IGameState & Schema>('game');

        // SYSTEMS
        // 1. process server messages
        this.systems.push(createServerMessageSystem(this.room, this));

        // 2. process client inputs and game logic
        this.systems.push(createClientPlayerInputSystem(this, this.room, this.collisions));
        this.systems.push(createColliderSystem(this.world, this.collisions));

        // 2b. gameplay ability systems
        this.systems.push(createGA_NullSystem(this.room));
        this.systems.push(createGA_MoveSystem(this.room));
        this.systems.push(createGA_DashSystem(this));
        this.systems.push(createGA_MeleeAttackSystem(this, this.room, this.world, this.collisions));
        this.systems.push(createGA_RangedAttackSystem(this, this.room, this.world, this.collisions));

        // 3. interpolation
        this.systems.push(createInterpolateSystem());

        // 4. render
        this.systems.push(createCircleSystem(this.world, this));
        this.systems.push(createRectangleSystem(this.world, this));

        // 5. utility
        this.systems.push(createPingSystem(this.room, this));
    }

    update() {
        // update systems
        this.systems.forEach(system => {
            system(this.world);
        });
    }
}