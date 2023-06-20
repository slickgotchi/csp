import { Client, Room } from 'colyseus';
import GameState from './GameState';
import * as Collisions from 'detect-collisions';
import { IWorld, addComponent, addEntity, createWorld } from 'bitecs';
import { AT_Move } from '../ecs/components/gas/ability-tasks/AT_Move';
import { System } from 'bitecs';
import { createSyncSystem } from '../ecs/systems/SyncSystem';
// import { createPlayerInputMessageSystem } from '../ecs/systems/PlayerInputMessageSystem';
import { createSendWorldStateSystem } from '../ecs/systems/SendWorldStateSystem';
import { createPf_ASC_Player } from '../ecs/prefabs/gas/ability-system-components/pfASC_Player';
import { createAT_MoveSystem } from '../ecs/systems/gas/ability-tasks/AT_MoveSystem';
import { createColliderSystem } from '../ecs/systems/collisions/ColliderSystem';
import { createObstacles } from './CreateObstacles';
import { createASC_PlayerSystem, recvMsBuffersByClient } from '../ecs/systems/gas/ability-system-components/ASC_PlayerSystem';
import { createASC_EnemySystem } from '../ecs/systems/gas/ability-system-components/ASC_EnemySystem';
import { createEnemies } from './CreateEnemies';
import { createGA_DashSystem } from '../ecs/systems/gas/gameplay-abilities/GA_DashSystem';
import { createGA_MoveSystem } from '../ecs/systems/gas/gameplay-abilities/GA_MoveSystem';
import { createGA_MeleeAttackSystem } from '../ecs/systems/gas/gameplay-abilities/GA_MeleeAttackSystem';
import { createGA_RangedAttackSystem } from '../ecs/systems/gas/gameplay-abilities/GA_RangedAttackSystem';


export default class GameRoom extends Room<GameState> {

    private collisionSystem!: Collisions.System;
    private world!: IWorld;
    private systems: System[] = [];

    onCreate() {
        console.log('onCreate()');

        this.setState(new GameState());

        this.collisionSystem = new Collisions.System();

        this.world = createWorld();

        this.onMessage('ping-server', (client: Client, client_time_ms: number) => {
            client.send('server-ping', client_time_ms);
        })

        this.maxClients = 2;
    }

    onJoin(client: Client) {
        console.log(`onJoin(): ${client.sessionId}`);

        const delta = this.clients.length === 1 ? 200 : -200;

        createPf_ASC_Player({
            room: this,
            world: this.world,
            system: this.collisionSystem,
            sessionId: client.sessionId,
            x: 1920/2 + delta,
            y: 1080/2
        })

        recvMsBuffersByClient.set(client, []);

        if (this.clients.length === this.maxClients) {
            this.lock();
            this.createMatch();
        }
    }

    onLeave(client: Client) {
        console.log(`onLeave(): ${client.sessionId}`);
    }

    onDispose() {
        console.log('onDispose()\n');
    }

    createMatch() {
        console.log('createMatch()');

        // create objects
        createEnemies(this, this.world, this.collisionSystem);
        createObstacles(this, this.world, this.collisionSystem);

        // messages
        // setupMessages(this);

        // systems
        // 1a. ASC systems => these process all inputs at start of frame
        this.systems.push(createASC_PlayerSystem(this));
        this.systems.push(createASC_EnemySystem(this));
        // this.systems.push(createPlayerInputMessageSystem(this));

        // 1b. GA Systems => these run when activated by ASC system
        this.systems.push(createGA_MoveSystem(this));
        this.systems.push(createGA_DashSystem(this));
        this.systems.push(createGA_MeleeAttackSystem(this, this.collisionSystem));
        this.systems.push(createGA_RangedAttackSystem(this, this.collisionSystem));

        // 1c. AT systems => these run when activated by GA system
        this.systems.push(createAT_MoveSystem());

        // 1d. GE systems => activated as side effects of AT's

        // 2. collisions
        this.systems.push(createColliderSystem(this, this.world, this.collisionSystem));

        // 3. sync ECS to gameObjects system and send world state
        this.systems.push(createSyncSystem(this));
        this.systems.push(createSendWorldStateSystem(this));

        // start updating
        this.setSimulationInterval((dt) => this.updateMatch(dt));
    }

    updateMatch(dt_ms: number) {
        // update server time
        this.state.serverTime_ms += dt_ms;

        // run systems
        this.systems.forEach(system => {
            system(this.world);
        });
    }

}