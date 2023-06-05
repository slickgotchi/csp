import { Client, Room } from 'colyseus';
import GameState from './GameState';
import { messages, setupMessages } from '../messages/Messages';
import { sGameObject } from '../types/sGameObject';

interface IInput {
    move: {
        dx: number,
        dy: number,
    },
    dt_ms: number,
    id: number,
}

let last_processed_input = 0;

export default class GameRoom extends Room<GameState> {

    private gameObject = new sGameObject();

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
    }

    private UPDATE_RATE_MS = 200;
    private accum = 0;

    updateMatch(dt_ms: number) {
        this.processMessages();
        this.sendWorldState(dt_ms);
    }


    processMessages() {
        const now = Date.now();
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (message.recv_ms <= now) {
                messages.splice(i,1);

                // act on message
                const input: IInput = message.payload;
                applyInput(this.gameObject, input);
                last_processed_input = input.id;
            }
        }
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
}