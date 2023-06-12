import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { ArcUtils } from "../../utilities/ArcUtils";
import { Timer } from "../../utilities/Timer";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";

import { Room } from 'colyseus.js';

import * as Collisions from 'detect-collisions';
import { circleCollidersByEid } from "./CollisionsSystem";
import { Interpolate } from "../componets/Interpolate";
import { ClientPlayerInput } from "../componets/ClientPlayerInput";
import { positionBufferByEid, saveBuffer } from "./InterpolateSystem";

export enum PlayerState {
    Idol,
    Moving,
    MeleeAttack,
    RangedAttack,
    Dash
}

export enum InputType {
    Idol,
    Move,
    Dash,
    MeleeAttack,
    RangedAttack,
    Waiting
}

export interface IInput {
    type: InputType,
    move: {
        dx: number,
        dy: number,
    },
    key_release: {
        l: boolean,
        j: boolean
    },
    dt_ms: number,
    id: number,
}

export const pending_inputs: IInput[] = [];
export let sequence_number = 0;
const EMIT_INTERVAL_MS = 100;

export const createClientPlayerInputSystem = (scene: Phaser.Scene, room: Room) => {

    const onUpdate = defineQuery([ClientPlayerInput, Player, Transform]);
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

    const j_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    let j_release = false;
    j_key?.on('up', () => { j_release = true; });

    const k_key = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    let k_release = false;
    k_key?.on('up', () => { k_release = true; });

    const timer = new Timer();
    let accum = 0;
    
    let state = PlayerState.Moving;
    let dir = {
        x: 0,
        y: 1
    }
    let waiting = false;

    return defineSystem((world: IWorld) => {

        // update
        timer.tick();

        // only do input as per our emit interval frequency
        accum += timer.dt_ms;
        if (accum < EMIT_INTERVAL_MS) {
            return world;
        } else {
            accum -= EMIT_INTERVAL_MS;
        }

        // calc move direction vector
        if (w_key?.isDown || a_key?.isDown || s_key?.isDown || d_key?.isDown) dir = {x:0,y:0}
        if (w_key?.isDown) dir.y = -1;
        if (a_key?.isDown) dir.x = -1;
        if (s_key?.isDown) dir.y = 1;
        if (d_key?.isDown) dir.x = 1;

        dir = ArcUtils.Vector2.normalise(dir);

        // update (NOTE: there should only ever be one client input eid)
        onUpdate(world).forEach(eid => {
            // determine input type
            let inputType = InputType.Idol;
            if (!waiting) {
                if (w_key?.isDown || a_key?.isDown || s_key?.isDown || d_key?.isDown) {
                    inputType = InputType.Move;
                }
                if (l_release) {
                    inputType = InputType.Dash;
                    waiting = true;
                    setTimeout(() => {waiting = false}, 100);
                    playDashAnim(scene, dir.x, dir.y, eid, 100);
                }
                if (j_release) {
                    inputType = InputType.MeleeAttack;
                    waiting = true;
                    setTimeout(() => {waiting = false}, 200);
                    playMeleeAttackAnim(scene, dir.x, dir.y, eid, 200);
                } 
                if (k_release) {
                    inputType = InputType.RangedAttack;
                    waiting = true;
                    setTimeout(() => {waiting = false}, 200);
                    playRangedAttackAnim(scene, dir.x, dir.y, eid, 200);
                }
            } else {
                inputType = InputType.Waiting;
            }

            // create an input
            const input: IInput = {
                type: inputType,
                move: {
                    dx: dir.x,
                    dy: dir.y,
                },
                key_release: {
                    l: l_release,
                    j: j_release,
                },
                dt_ms: timer.dt_ms > EMIT_INTERVAL_MS ? timer.dt_ms : EMIT_INTERVAL_MS,
                id: sequence_number++
            }

            room.send("client-input", input);
            
            if (ClientPlayerInput.isClientSidePrediction[eid]) {
                // do client side prediction
                applyInput(eid, input);

                // THESE TWO FUNCTIONS COULD BE MOVED OUT OF HERE
                resolveCollisions(eid);
                saveBuffer(eid);
            }
            
            // add to pending inputs
            pending_inputs.push(input);
            
            // reset key status'
            j_release = false;
            k_release = false;
            l_release = false;
        });

        return world;
    });
}

// core input function
export const applyInput = (eid: number, input: IInput) => {
    // apply input depending on state
    switch(input.type) {
        case InputType.Move: {
            Transform.x[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
            Transform.y[eid] += 400 * input.move.dy * input.dt_ms * 0.001;
            break;
        }
        case InputType.Dash: {
            Transform.x[eid] += input.move.dx * 500;
            Transform.y[eid] += input.move.dy * 500;
            break;
        }
        case InputType.MeleeAttack: {
            Transform.x[eid] += input.move.dx * 100;
            Transform.y[eid] += input.move.dy * 100;
            break;
        }
        default: break;
    }
}

export const resolveCollisions = (eid: number) => {
    const playerCollider = circleCollidersByEid.get(eid);
    if (!playerCollider) return;
    const collisionSystem = playerCollider.system;
    if (!collisionSystem) return;

    // 1. set collider to player
    playerCollider.setPosition(
        Transform.x[eid],
        Transform.y[eid]
    );

    // 2. do collisions
    collisionSystem.checkOne(playerCollider, (response: Collisions.Response) => {
        const { overlapV } = response;
        playerCollider.setPosition(
            playerCollider.x - overlapV.x,
            playerCollider.y - overlapV.y
        )
    });

    // 3. set player to new collider
    Transform.x[eid] = playerCollider.x;
    Transform.y[eid] = playerCollider.y;
}



const playDashAnim = (scene: Phaser.Scene, dx: number, dy: number, eid: number, duration_ms: number) => {
    const line = scene.add.line(
        0,
        0,
        Transform.x[eid], // start x
        Transform.y[eid], // start y
        Transform.x[eid] + dx*500, // end x
        Transform.y[eid] + dy*500, // end y
        0x66ff66
    )
        .setOrigin(0,0)
        .setDepth(-1)
        .setAlpha(0)

    scene.add.tween({
        targets: line,
        alpha: 1,
        duration: duration_ms,
        yoyo: true,
        onComplete: () => {
            line.destroy();
        }
    });
}

const playMeleeAttackAnim = (scene: Phaser.Scene, dx: number, dy: number, eid: number, duration_ms: number) => {
    // create circle
    const circ = scene.add.circle(
        Transform.x[eid] + dx*200,
        Transform.y[eid] + dy*200,
        150,
        0xffffff
    );
    circ.setAlpha(0.75);
    
    // tween
    scene.add.tween({
        targets: circ,
        alpha: 0,
        duration: duration_ms,
        onComplete: () => {
            circ.destroy();
        }
    })
}   

const playRangedAttackAnim = (scene: Phaser.Scene, dx: number, dy: number, eid: number, duration_ms: number) => {
    // create circle
    const circ = scene.add.circle(
        Transform.x[eid] + dx*85,
        Transform.y[eid] + dy*85,
        35,
        0xffffff
    );
    circ.setAlpha(0.75);
    
    // tween
    scene.add.tween({
        targets: circ,
        x: Transform.x[eid] + dx*1000,
        y: Transform.y[eid] + dy*1000,
        duration: duration_ms,
        onComplete: () => {
            circ.destroy();
        }
    });
}