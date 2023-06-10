import { Client, Room } from 'colyseus';
import GameState from './GameState';
import { IInput, IMessage, InputType, PlayerState, setupMessages } from '../messages/Messages';
import { sGameObject } from '../types/sGameObject';

import * as Collisions from 'detect-collisions';
import { sPlayer } from '../types/sPlayer';
import { createPlayer } from './CreatePlayer';
import { sEnemy } from '../types/sEnemy';
import { ArcUtils } from '../utilities/ArcUtils';
import { IWorld, createWorld } from 'bitecs';
import { createRectangles } from './CreateRectangles';
import { createEnemies } from './CreateEnemies';

// let last_processed_input = 0;
const recvMsBuffersByClient = new Map<Client,number[]>();
const BUFFER_SIZE = 50;

export default class GameRoom extends Room<GameState> {

    private collisionSystem!: Collisions.System;
    private world!: IWorld;

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

        createPlayer(this, this.world, client.sessionId, this.collisionSystem);

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
        createRectangles(this, this.world, this.collisionSystem);
        createEnemies(this, this.world, this.collisionSystem);

        // messages
        setupMessages(this);

        // start updating
        this.setSimulationInterval((dt) => this.updateMatch(dt));
    }

    private UPDATE_RATE_MS = 100;
    private accum = 0;

    updateMatch(dt_ms: number) {
        this.processMessages(dt_ms);
        this.resolveCollisions();
        this.sendWorldState(dt_ms);
    }


    processMessages(dt_ms: number) {
        const now = Date.now();

        this.state.gameObjects.forEach(go => {
            switch (go.type) {
                case 'player': {
                    const playerGo = go as sPlayer;
                    for (let i = 0; i < playerGo.messages.length; i++) {
                        let message = playerGo.messages[i];
                        if (message.recv_ms <= now) {
                            playerGo.messages.splice(i,1);
            
                            // validate our message
                            message = validateMessage(message);
            
                            // apply input
                            const input: IInput = message.payload;
                            applyInput(playerGo, input);
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

                    // update collider
                    enemyGo.collider?.setPosition(enemyGo.x, enemyGo.y);
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
            if (go.type === 'player') {
                const playerGo = go as sPlayer;
                if (!playerGo.collider) return;

                // 1. update collider positions as per processed server messages
                playerGo.collider.setPosition(playerGo.x, playerGo.y);

                // 2. check collisions
                this.collisionSystem.checkOne(playerGo.collider, (response: Collisions.Response) => {
                    if (!playerGo.collider) return;
                    const { overlapV, b } = this.collisionSystem.response;
                    console.log('touch: ', this.count++);
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

            }
        });
    }

    sendWorldState(dt_ms: number) {
        this.accum += dt_ms;
        while (this.accum >= this.UPDATE_RATE_MS) {
            this.broadcast('server-update');
            this.accum -= this.UPDATE_RATE_MS;
        }
    }
}

const applyInput = (gameObject: sGameObject, input: IInput) => {
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

// const recv_ms_buffer: number[] = [];


const validateMessage = (message: IMessage) => {
    const recv_ms_buffer = recvMsBuffersByClient.get(message.client);
    if (!recv_ms_buffer) {
        recvMsBuffersByClient.set(message.client, []);
        return message;
    }

    // store receive times in buffer
    recv_ms_buffer.push(message.recv_ms);
    if (recv_ms_buffer.length > BUFFER_SIZE) {
        recv_ms_buffer.splice(0,1);
    }

    // if 10 entries we can calc average delta
    if (recv_ms_buffer.length >= 10) {
        const av_delta_ms = averageDelta(recv_ms_buffer);
        message.payload.dt_ms = av_delta_ms;
        return message;
    } else {
        return message;
    }

}

const averageDelta = (arr: number[]) => {
    let deltaSum = 0;
    for (let i = 0; i < arr.length-2; i++) {
        deltaSum += arr[i+1] - arr[i];
    }
    return deltaSum / (arr.length-1);
}