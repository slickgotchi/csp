import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { ArcUtils } from "../../utilities/ArcUtils";
import { ClientInput } from "../componets/ClientInput";
import { Timer } from "../../utilities/Timer";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";

import { Room } from 'colyseus.js';
import { CSP } from "../../scenes/Game";

import * as Collisions from 'detect-collisions';
import { circleCollidersByEid } from "./CollisionsSystem";

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

export const position_buffer: {
    x: number,
    y: number,
    timestamp: number,
}[] = [];
export let interp_dt_ms = 0;
export const setInterpDtMs = (dt_ms: number) => {
    interp_dt_ms = dt_ms;
}

export const pending_inputs: IInput[] = [];
export let sequence_number = 0;

const EMIT_INTERVAL_MS = 100;
let accum = 0;


export const createClientInputSystem = (scene: Phaser.Scene, room: Room) => {

    const onUpdate = defineQuery([ClientInput, Player, Transform]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    const qPlayer = defineQuery(['player']);

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

            room.send("client-input", input);

            // save data for dash render
            const x0 = Transform.position.x[eid];
            const y0 = Transform.position.y[eid];
            
            if (ClientInput.isClientSidePrediction[eid]) {
                // do client side prediction
                applyInput(eid, input, true);
            }
            
            // add to pending inputs
            pending_inputs.push(input);
            
            // renderDash
            if (l_release) {
                renderDash(x0, y0, Transform.position.x[eid], Transform.position.y[eid], scene);
            }
            
            l_release = false;
        });

        return world;
    });
}

// const collisionSystem = new Collisions.System();

// const playerCollider = collisionSystem.createCircle({x:0,y:0}, 50);

// const boxCollider = collisionSystem.createBox(
//     {x: 1500,y:500},
//     200, 200
// )

export const applyInput = (eid: number, input: IInput, buffer: boolean = false) => {
    Transform.position.x[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
    Transform.position.y[eid] += 400 * input.move.dy * input.dt_ms * 0.001;

    if (input.key_release.l) {
        Transform.position.x[eid] += input.move.dx * 500;
        Transform.position.y[eid] += input.move.dy * 500;
    }

    const playerCollider = circleCollidersByEid.get(eid);
    if (!playerCollider) return;
    const collisionSystem = playerCollider.system;
    if (!collisionSystem) return;

    // COLLISIONS
    // 1. set collider to player
    playerCollider.setPosition(
        Transform.position.x[eid],
        Transform.position.y[eid]
    );

    // 2. do collisions
    collisionSystem.checkOne(playerCollider, (resp: Collisions.Response) => {
        const { overlapV } = collisionSystem.response;
        playerCollider.setPosition(
            playerCollider.x - overlapV.x,
            playerCollider.y - overlapV.y
        )
    });

    // 3. set player to new collider
    Transform.position.x[eid] = playerCollider.x;
    Transform.position.y[eid] = playerCollider.y;

    // update position buffer
    if (buffer) {
        position_buffer.push({
            x: Transform.position.x[eid],
            y: Transform.position.y[eid],
            timestamp: Date.now()
        });
        interp_dt_ms = 0;
    }
}


const renderDash = (x0: number, y0: number, x1: number, y1: number, scene: Phaser.Scene) => {
    const line = scene.add.line(
        0,0,
        x0,y0,
        x1,y1,
        0x66ff66
    )
        .setOrigin(0,0)
        .setDepth(-1)
        .setAlpha(0)

    scene.add.tween({
        targets: line,
        alpha: 1,
        duration: 125,
        yoyo: true,
        onComplete: () => {
            line.destroy();
        }
    });
}