import { IWorld, System, addEntity, createWorld } from "bitecs";
import * as Phaser from "phaser";
import { Client, Room } from 'colyseus.js';
import { Schema } from "@colyseus/schema";
import { IGameState } from '../../../server/src/types/IGameState';
import * as Collisions from 'detect-collisions';
import { createServerMessage_System } from "../ecs/systems/network/ServerMessage_System";
import { createClientPlayerInput_System } from "../ecs/systems/input/ClientPlayerInput_System";
import { createCollider_System } from "../ecs/systems/collisions/Collider_System";
import { createGA_Null_System } from "../ecs/systems/gas/gameplay-abilities/GA_Null_System";
import { createGA_Move_System } from "../ecs/systems/gas/gameplay-abilities/GA_Move_System";
import { createGA_Dash_System } from "../ecs/systems/gas/gameplay-abilities/GA_Dash_System";
import { createGA_MeleeAttack_System } from "../ecs/systems/gas/gameplay-abilities/GA_MeleeAttack_System";
import { createGA_RangedAttack_System } from "../ecs/systems/gas/gameplay-abilities/GA_RangedAttack_System";
import { createGA_PortalMageAxe_System } from "../ecs/systems/gas/gameplay-abilities/GA_PortalMageAxe_System";
import { createInterpolate_System } from "../ecs/systems/render/Interpolate_System";
import { createCircle_System } from "../ecs/systems/render/Circle_System";
import { createRectangle_System } from "../ecs/systems/render/Rectangle_System";
import { createSector_System } from "../ecs/systems/render/Sector_System";
import { createPing_System } from "../ecs/systems/network/Ping_System";

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
        this.systems.push(createServerMessage_System(this));

        // 2. process client inputs and game logic
        this.systems.push(createClientPlayerInput_System(this));
        this.systems.push(createCollider_System(this));

        // 2b. gameplay ability systems
        this.systems.push(createGA_Null_System(this));
        this.systems.push(createGA_Move_System(this));
        this.systems.push(createGA_Dash_System(this));
        this.systems.push(createGA_MeleeAttack_System(this));
        this.systems.push(createGA_RangedAttack_System(this));
        this.systems.push(createGA_PortalMageAxe_System(this));

        // 3a. interpolation
        this.systems.push(createInterpolate_System());

        // 3b. render
        this.systems.push(createCircle_System(this));
        this.systems.push(createRectangle_System(this));
        this.systems.push(createSector_System(this));

        // 5. utility
        this.systems.push(createPing_System(this));
    }

    update() {
        // update systems
        this.systems.forEach(system => {
            system(this.world);
        });
    }
}