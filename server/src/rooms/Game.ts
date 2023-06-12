import { Client, Room } from 'colyseus';
import GameState from './GameState';
import { IInput, IInputMessage, InputType, setupMessages } from '../messages/Messages';
import { sGameObject } from '../types/sGameObject';

import * as Collisions from 'detect-collisions';
import { sPlayer } from '../types/sPlayer';
import { createPlayer } from './CreatePlayer';
import { sEnemy } from '../types/sEnemy';
import { ArcUtils } from '../utilities/ArcUtils';
import { IWorld, addComponent, createWorld } from 'bitecs';
import { createRectangles } from './CreateRectangles';
import { createEnemies } from './CreateEnemies';
import { GA_Move } from '../ecs/components/gas/gameplay-abilities/GA_Move';
import { AT_Move } from '../ecs/components/gas/ability-tasks/AT_Move';
import { getInputTypeAbilityRouteString } from './TryActivateAbility';
import { System } from 'bitecs';
import { createSyncSystem } from '../ecs/systems/SyncSystem';
import { createPlayerInputMessageSystem } from '../ecs/systems/PlayerInputMessageSystem';
import { createSendWorldStateSystem } from '../ecs/systems/SendWorldStateSystem';
import { createPf_ASC_Player } from '../ecs/prefabs/gas/ability-system-components/pfASC_Player';
import { createAT_MoveSystem } from '../ecs/systems/gas/ability-tasks/AT_MoveSystem';
import { createColliderSystem } from '../ecs/systems/collisions/ColliderSystem';
import { createObstacles } from './CreateObstacles';


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

        // createPlayer(this, this.world, client.sessionId, this.collisionSystem);

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
        // createRectangles(this, this.world, this.collisionSystem);
        // createEnemies(this, this.world, this.collisionSystem);
        createObstacles(this, this.world, this.collisionSystem);

        // messages
        setupMessages(this);

        // systems
        // 1. playerInputMessageSystem
        this.systems.push(createPlayerInputMessageSystem(this));

        // 1a. Ability Task systems
        this.systems.push(createAT_MoveSystem());

        // 2. collisions
        this.systems.push(createColliderSystem(this, this.world, this.collisionSystem));

        // 3. sync ECS to gameObjects system and send world state
        this.systems.push(createSyncSystem(this));
        this.systems.push(createSendWorldStateSystem(this));

        // start updating
        this.setSimulationInterval((dt) => this.updateMatch(dt));
    }

    updateMatch(dt_ms: number) {
        // this.processMessages(dt_ms);
        // this.resolveCollisions();
        // this.sendWorldState(dt_ms);

        this.systems.forEach(system => {
            system(this.world);
        });
    }



    processMessages(dt_ms: number) {
        const now = Date.now();

        this.state.gameObjects.forEach(go => {
            switch (go.type) {
                case 'player': {
                    const playerGo = go as sPlayer;
                    for (let i = 0; i < playerGo.inputMessages.length; i++) {
                        let message = playerGo.inputMessages[i];
                        if (message.recv_ms <= now) {
                            playerGo.inputMessages.splice(i,1);
            
                            // validate our message
                            message = validateInputMessage(message);
            
                            // apply input
                            const input: IInput = message.payload;
                            applyInput(this.world, go.serverEid, playerGo, input);
                            playerGo.last_processed_input = input.id;
                        }
                    }
                    break;
                }
                case 'enemy': {
                    const enemyGo = go as sEnemy;
                    enemyGo.timer_ms -= dt_ms;
                    if (enemyGo.timer_ms <= 0) {
                        // change direction
                        const v = ArcUtils.Vector2.normalise({x:Math.random()-0.5, y:Math.random()-0.5});
                        enemyGo.dx = v.x;
                        enemyGo.dy = v.y;

                        enemyGo.timer_ms = Math.random()*3000 + 1000;
                    }
                    enemyGo.x += enemyGo.dx * 50 * dt_ms * 0.001;
                    enemyGo.y += enemyGo.dy * 50 * dt_ms * 0.001;

                    
                    break;
                }
                default: break;
            }
        })
    }

    count = 0;

    resolveCollisions() {
        // find player collider
        this.state.gameObjects.forEach(go => {
            switch (go.type) {
                case 'player': {
                    const playerGo = go as sPlayer;
                    if (!playerGo.collider) break;
    
                    // 1. update collider positions as per processed server messages
                    playerGo.collider.setPosition(playerGo.x, playerGo.y);
    
                    // 2. check collisions
                    this.collisionSystem.checkOne(playerGo.collider, (response: Collisions.Response) => {
                        if (!playerGo.collider) return;
                        const { overlapV, b } = response;
                        if (b.isStatic) {
                            playerGo.collider.setPosition(
                                playerGo.collider.x - overlapV.x,
                                playerGo.collider.y - overlapV.y
                            )
                        }
                    })
    
                    // 3. update game object to new position
                    playerGo.x = playerGo.collider.x;
                    playerGo.y = playerGo.collider.y;
                    break;
                }
                case 'enemy': {
                    const enemyGo = go as sEnemy;
                    if (!enemyGo.collider) break;

                    // 1. update collider positions
                    enemyGo.collider.setPosition(enemyGo.x, enemyGo.y);

                    // 2. check collisions
                    this.collisionSystem.checkOne(enemyGo.collider, (response) => {
                        if (!enemyGo.collider) return;
                        const { overlapV, b } = response;
                        if (b.isStatic) {
                            enemyGo.collider.setPosition(
                                enemyGo.collider.x - overlapV.x,
                                enemyGo.collider.y - overlapV.y
                            );
                        }
                    });

                    // 3. update game object to revised collider os
                    enemyGo.x = enemyGo.collider.x;
                    enemyGo.y = enemyGo.collider.y;

                    break;
                }
                default: break;
            }
        });
    }

    private EMIT_INTERVAL_MS = 100;
    private accum = 0;

    // sendWorldState(dt_ms: number) {
    //     this.accum += dt_ms;
    //     while (this.accum >= this.EMIT_INTERVAL_MS) {
    //         this.broadcast('server-update');
    //         this.accum -= this.EMIT_INTERVAL_MS;
    //     }
    // }
}

const applyInput = (world: IWorld, eid: number, gameObject: sGameObject, input: IInput) => {
    // if InputType.Move => 
    // tryActivateAbility(GA_Move)
    const str = getInputTypeAbilityRouteString(input.type);
    const handler = (tryActivateGameplayAbilityRoutes as any)[str];
    handler(world, eid, input);

    // apply input depending on state
    switch(input.type) {
        case InputType.Move: {
            gameObject.x += 400 * input.move.dx * input.dt_ms * 0.001;
            gameObject.y += 400 * input.move.dy * input.dt_ms * 0.001;
            break;
        }
        case InputType.Dash: {
            gameObject.x += input.move.dx * 500;
            gameObject.y += input.move.dy * 500;
            break;
        }
        case InputType.MeleeAttack: {
            gameObject.x += input.move.dx * 100;
            gameObject.y += input.move.dy * 100;
            break;
        }
        case InputType.RangedAttack: {

            break;
        }
        default: break;
    }
}

const tryActivateGA_Move = (world: IWorld, input: IInput, eid: number) => {
    addComponent(world, AT_Move, eid);
    AT_Move.dx[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
    AT_Move.dy[eid] += 400 * input.move.dy * input.dt_ms * 0.001;
}

const tryActivateGameplayAbilityRoutes = {
    'ga-move': tryActivateGA_Move 
}


const recvMsBuffersByClient = new Map<Client,number[]>();
const BUFFER_SIZE = 50;

const validateInputMessage = (inputMessage: IInputMessage) => {
    const recv_ms_buffer = recvMsBuffersByClient.get(inputMessage.client);
    if (!recv_ms_buffer) {
        recvMsBuffersByClient.set(inputMessage.client, []);
        return inputMessage;
    }

    // store receive times in buffer
    recv_ms_buffer.push(inputMessage.recv_ms);
    if (recv_ms_buffer.length > BUFFER_SIZE) {
        recv_ms_buffer.splice(0,1);
    }

    // if 10 entries we can calc average delta
    if (recv_ms_buffer.length >= 10) {
        const av_delta_ms = averageDelta(recv_ms_buffer);
        inputMessage.payload.dt_ms = av_delta_ms;
        return inputMessage;
    } else {
        return inputMessage;
    }

}

const averageDelta = (arr: number[]) => {
    let deltaSum = 0;
    for (let i = 0; i < arr.length-2; i++) {
        deltaSum += arr[i+1] - arr[i];
    }
    return deltaSum / (arr.length-1);
}