import { Client, Room } from 'colyseus';
import GameState from './GameState';
import { IInput, IMessage, messages, setupMessages } from '../messages/Messages';
import { sGameObject } from '../types/sGameObject';
import { sRectangle } from '../types/sRectangle';

let last_processed_input = 0;

export default class GameRoom extends Room<GameState> {

    private gameObject = new sGameObject();
    private rectangle!: sRectangle;


    onCreate() {
        console.log('Room created');

        this.maxClients = 1;
    }

    onJoin(client: Client) {
        console.log(`${client.sessionId} joined room`);

        if (this.clients.length === this.maxClients) {
            this.createMatch();
        }
    }

    onLeave(client: Client) {
        console.log(`${client.sessionId} left room`);
    }

    createMatch() {
        console.log('Match created');



        setupMessages(this);

        this.setSimulationInterval((dt) => this.updateMatch(dt));

        // create collision stuff
        // setup rectangle
        this.rectangle = new sRectangle();
        this.rectangle.position.x = 1200;
        this.rectangle.position.y = 300;
        this.rectangle.width = 100;
        this.rectangle.height = 100;

        // setup player
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
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            if (message.recv_ms <= now) {
                messages.splice(i,1);

                // validate our message
                message = validateMessage(message);

                // apply input
                const input: IInput = message.payload;
                applyInput(this.gameObject, input);
                last_processed_input = input.id;

                if (input.key_release.l) {
                    console.log('L released');
                }
            }
        }
    }

    resolveCollisions() {

    }

    sendWorldState(dt_ms: number) {
        this.accum += dt_ms;
        while (this.accum >= this.UPDATE_RATE_MS) {
            this.broadcast('server-update', {
                gameObject: this.gameObject,
                last_processed_input: last_processed_input
            });
            this.accum -= this.UPDATE_RATE_MS;
        }
    }
}

const applyInput = (gameObject: sGameObject, input: IInput) => {
    gameObject.position.x += 400 * input.move.dx * input.dt_ms * 0.001;
    gameObject.position.y += 400 * input.move.dy * input.dt_ms * 0.001;

    if (input.key_release.l) {
        gameObject.position.x += input.move.dx * 500;
        gameObject.position.y += input.move.dy * 500;
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