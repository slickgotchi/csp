import { IWorld, defineQuery, defineSystem } from "bitecs"
import { ArcUtils } from "../../utilities/ArcUtils";
import { ClientInput } from "../componets/ClientInput";
import { Timer } from "../../utilities/Timer";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";

import { Room } from 'colyseus.js';
import { CSP } from "../../scenes/Game";

interface IInput {
    move: {
        dx: number,
        dy: number,
    },
    dt_ms: number,
    id: number,
}

export const pending_inputs: IInput[] = [];
export let sequence_number = 0;

export const createClientInputSystem = (scene: Phaser.Scene, room: Room) => {

    const qUpdate = defineQuery([ClientInput, Player, Transform]);

    const w_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const a_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const s_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const d_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        let vel = {x: 0, y: 0}

        if (w_key?.isDown) vel.y = -1;
        if (a_key?.isDown) vel.x = -1;
        if (s_key?.isDown) vel.y = 1;
        if (d_key?.isDown) vel.x = 1;

        vel = ArcUtils.Vector2.normalise(vel);

        const onUpdate = qUpdate(world);
        onUpdate.forEach(eid => {
            const input: IInput = {
                move: {
                    dx: vel.x,
                    dy: vel.y,
                },
                dt_ms: timer.dt_ms,
                id: sequence_number++
            }
            room.send("client-input", input);

            if (ClientInput.isClientSidePrediction) {
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
}