import { Client, Room } from 'colyseus';
import GameState from './GameState';
import { IInput, IMessage, InputType, PlayerState, setupMessages } from '../messages/Messages';
import { sGameObject } from '../types/sGameObject';
import { sRectangle } from '../types/sRectangle';

import * as Collisions from 'detect-collisions';
import { createObjects } from './CreateObjects';
import { sPlayer } from '../types/sPlayer';
import { createPlayer } from './CreatePlayer';

// let last_processed_input = 0;

export default class GameRoom extends Room<GameState> {

    private collisionSystem!: Collisions.System;

    onCreate() {
        console.log('onCreate()');

        this.setState(new GameState());

        this.collisionSystem = new Collisions.System();

        this.maxClients = 1;
    }

    onJoin(client: Client) {
        console.log(`onJoin(): ${client.sessionId}`);

        createPlayer(this, client.sessionId, this.collisionSystem);

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
        while (this.state.gameObjects.length > 0) {
            this.state.gameObjects.deleteAt(0)

        }
    }

    createMatch() {
        console.log('createMatch()');

        // create objects
        createObjects(this, this.collisionSystem);

        // messages
        setupMessages(this);

        // start updating
        this.setSimulationInterval((dt) => this.updateMatch(dt));
    }

    private UPDATE_RATE_MS = 200;
    private accum = 0;

    updateMatch(dt_ms: number) {
        this.processMessages();
        this.resolveCollisions();
        this.sendWorldState(dt_ms);
    }


    processMessages() {
        const now = Date.now();

        this.state.gameObjects.forEach(go => {
            const playerGo = go as sPlayer;
            if (playerGo.type === 'player') {
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
        
                        if (input.key_release.l) {
                            console.log('L released');
                        }
                    }
                }
            }
        })

        // for (let i = 0; i < messages.length; i++) {
        //     let message = messages[i];
        //     if (message.recv_ms <= now) {
        //         messages.splice(i,1);

        //         // validate our message
        //         message = validateMessage(message);

        //         // apply input
        //         const input: IInput = message.payload;
        //         applyInput(this.gameObject, input);
        //         last_processed_input = input.id;

        //         if (input.key_release.l) {
        //             console.log('L released');
        //         }
        //     }
        // }
    }

    resolveCollisions() {
        // find player collider
        this.state.gameObjects.forEach(go => {
            if (go.type === 'player') {
                const playerGo = go as sPlayer;
                if (!playerGo.collider) return;

                // 1. update collider positions as per processed server messages
                playerGo.collider.setPosition(playerGo.pos.x, playerGo.pos.y);

                // 2. check collisions
                this.collisionSystem.checkOne(playerGo.collider, (response: Collisions.Response) => {
                    if (!playerGo.collider) return;
                    const { overlapV } = this.collisionSystem.response;
                    playerGo.collider.setPosition(
                        playerGo.collider.x - overlapV.x,
                        playerGo.collider.y - overlapV.y
                    )
                })

                // 3. update game object to new position
                playerGo.pos.x = playerGo.collider.x;
                playerGo.pos.y = playerGo.collider.y;

            }
        });
    }

    sendWorldState(dt_ms: number) {
        this.accum += dt_ms;
        while (this.accum >= this.UPDATE_RATE_MS) {
            this.broadcast('server-update', this.state.gameObjects);
            // {
            //     gameObject: this.gameObject,
            //     last_processed_input: last_processed_input
            // });
            this.accum -= this.UPDATE_RATE_MS;
        }
    }
}

const applyInput = (gameObject: sGameObject, input: IInput) => {
    // apply input depending on state
    switch(input.type) {
        case InputType.Move: {
            gameObject.pos.x += 400 * input.move.dx * input.dt_ms * 0.001;
            gameObject.pos.y += 400 * input.move.dy * input.dt_ms * 0.001;
            break;
        }
        case InputType.Dash: {
            gameObject.pos.x += input.move.dx * 500;
            gameObject.pos.y += input.move.dy * 500;
            break;
        }
        case InputType.MeleeAttack: {
            gameObject.pos.x += input.move.dx * 100;
            gameObject.pos.y += input.move.dy * 100;
            break;
        }
        case InputType.RangedAttack: {

            break;
        }
        default: break;
    }
}

const recv_ms_buffer: number[] = [];
const BUFFER_SIZE = 50;

const validateMessage = (message: IMessage) => {
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