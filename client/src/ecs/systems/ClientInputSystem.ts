import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { ArcUtils } from "../../utilities/ArcUtils";
import { ClientInput } from "../componets/ClientInput";
import { Timer } from "../../utilities/Timer";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";

import { Room } from 'colyseus.js';
import { CSP } from "../../scenes/Game";

export interface IInput {
    move: {
        dx: number,
        dy: number,
    },
    key_release: {
        l: boolean
    },
    dt_ms: number,
    id: number,
}

export const pending_inputs: IInput[] = [];
export let sequence_number = 0;

const EMIT_INTERVAL_MS = 100;
let accum = 0;


export const createClientInputSystem = (scene: Phaser.Scene, room: Room) => {

    const onUpdate = defineQuery([ClientInput, Player, Transform]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    const w_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const a_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const s_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const d_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    const l_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    let l_release = false;
    l_key?.on('up', () => { l_release = true; });

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        // update
        timer.tick();

        accum += timer.dt_ms;
        if (accum < EMIT_INTERVAL_MS) {
            return world;
        } else {
            accum -= EMIT_INTERVAL_MS;
        }

        let norm = {x: 0, y: 0}

        if (w_key?.isDown) norm.y = -1;
        if (a_key?.isDown) norm.x = -1;
        if (s_key?.isDown) norm.y = 1;
        if (d_key?.isDown) norm.x = 1;

        norm = ArcUtils.Vector2.normalise(norm);

        onUpdate(world).forEach(eid => {
            const input: IInput = {
                move: {
                    dx: norm.x,
                    dy: norm.y,
                },
                key_release: {
                    l: l_release,
                },
                dt_ms: timer.dt_ms > EMIT_INTERVAL_MS ? timer.dt_ms : EMIT_INTERVAL_MS,
                id: sequence_number++
            }

            l_release = false;

            room.send("client-input", input);

            if (ClientInput.isClientSidePrediction[eid]) {
                // do client side prediction
                applyInput(eid, input);
            }

            // add to pending inputs
            pending_inputs.push(input);
        });

        return world;
    });
}

export const applyInput = (eid: number, input: IInput) => {
    Transform.position.x[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
    Transform.position.y[eid] += 400 * input.move.dy * input.dt_ms * 0.001;

    if (input.key_release.l) {
        Transform.position.x[eid] += input.move.dx * 500;
        Transform.position.y[eid] += input.move.dy * 500;
    }
}