import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { ArcUtils } from "../../utilities/ArcUtils";
import { Timer } from "../../utilities/Timer";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";

import { Room } from 'colyseus.js';
import { CSP } from "../../scenes/Game";

import * as Collisions from 'detect-collisions';
import { circleCollidersByEid } from "./CollisionsSystem";
import { Interpolate } from "../componets/Interpolate";
import { ClientPlayerInput } from "../componets/ClientPlayerInput";

export enum PlayerState {
    Idol,
    Moving,
    MeleeAttack,
    RangedAttack,
    Dash
}

export interface IInput {
    state: PlayerState,
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

export const position_buffer: {
    x: number,
    y: number,
    timestamp: number,
}[] = [];


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
        if (w_key?.isDown) dir.y = -1;
        if (a_key?.isDown) dir.x = -1;
        if (s_key?.isDown) dir.y = 1;
        if (d_key?.isDown) dir.x = 1;

        dir = ArcUtils.Vector2.normalise(dir);

        // update (NOTE: there should only ever be one client input eid)
        onUpdate(world).forEach(eid => {
            // determine state
            if (w_key?.isUp && a_key?.isUp && s_key?.isUp && d_key?.isUp) {
                state = PlayerState.Idol;
            } else {
                state = PlayerState.Moving;
                if (l_release) {
                    state = PlayerState.Dash;
                } else if (j_release) {
                    state = PlayerState.MeleeAttack;
                } else if (k_release) {
                    state = PlayerState.RangedAttack;
                }
            }

            // create an input
            const input: IInput = {
                state: state,
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

            // // melee attack
            // if (j_release && state === PlayerState.Moving) {
            //     const ATTACK_DURATION_MS = 500;
            //     meleeAttack(norm.x, norm.y, eid, scene, ATTACK_DURATION_MS);
            //     state = PlayerState.MeleeAttack;
            //     setTimeout(() => {
            //         state = PlayerState.Moving;
            //     }, ATTACK_DURATION_MS)
            // }
            
            // save data for dash render
            const x0 = Transform.x[eid];
            const y0 = Transform.y[eid];
            
            if (ClientPlayerInput.isClientSidePrediction[eid]) {
                // do client side prediction
                applyInput(eid, input, true);

                saveBuffer(eid);
            }
            
            // add to pending inputs
            pending_inputs.push(input);
            
            // renderDash
            if (l_release && state === PlayerState.Moving) {
                console.log('l release');
                renderDash(x0, y0, Transform.x[eid], Transform.y[eid], scene);
            }
            
            
            l_release = false;
            j_release = false;
        });

        return world;
    });
}

// Different types of input
// 1. Move
// 2. Instantaneous dash
// 3. Melee attack over several ms that moves player
// 4. Ranged attack with projectile that stops player movement
// 5. 

export const applyInput = (eid: number, input: IInput, buffer: boolean = false) => {
    // apply input depending on state
    switch(input.state) {
        case PlayerState.Moving: {
            Transform.x[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
            Transform.y[eid] += 400 * input.move.dy * input.dt_ms * 0.001;
            break;
        }
        case PlayerState.Dash: {

            break;
        }
        case PlayerState.MeleeAttack: {

            break;
        }
        default: break;
    }
    

    if (input.key_release.l) {
        Transform.x[eid] += input.move.dx * 500;
        Transform.y[eid] += input.move.dy * 500;
    }

    const playerCollider = circleCollidersByEid.get(eid);
    if (!playerCollider) return;
    const collisionSystem = playerCollider.system;
    if (!collisionSystem) return;

    // COLLISIONS
    // 1. set collider to player
    playerCollider.setPosition(
        Transform.x[eid],
        Transform.y[eid]
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
    Transform.x[eid] = playerCollider.x;
    Transform.y[eid] = playerCollider.y;

}

const saveBuffer = (eid: number) => {
    // update position buffer
        position_buffer.push({
            x: Transform.x[eid],
            y: Transform.y[eid],
            timestamp: Date.now()
        });
        Interpolate.dt_ms[eid] = 0; // reset interpolation time
}


// const renderDash = (x0: number, y0: number, x1: number, y1: number, scene: Phaser.Scene) => {
//     const line = scene.add.line(
//         0,0,
//         x0,y0,
//         x1,y1,
//         0x66ff66
//     )
//         .setOrigin(0,0)
//         .setDepth(-1)
//         .setAlpha(0)

//     scene.add.tween({
//         targets: line,
//         alpha: 1,
//         duration: 125,
//         yoyo: true,
//         onComplete: () => {
//             line.destroy();
//         }
//     });
// }

// const meleeAttack = (dx: number, dy: number, eid: number, scene: Phaser.Scene, duration: number) => {
//     const dt = {t: 0};

//     const start = {
//         x: Transform.x[eid],
//         y: Transform.y[eid]
//     }

//     const thrust = 100;

//     // animation split
//     // 20% windup
//     // 40% thrust
//     // 40% attack flash
//     const windup_ms = duration * 0.2;
//     const thrust_ms = duration * 0.8;
//     const flash_ms = duration * 0.6;

//     const timeline = scene.add.timeline([
//         {
//             at: 0,
//             tween: {
//                 targets: dt,
//                 t: 1,
//                 onUpdate: () => {
//                     Transform.x[eid] = start.x - dx*windup*dt.t;
//                     Transform.y[eid] = start.y - dy*windup*dt.t;
//                 },
//                 onComplete: () => {
//                     start.x = Transform.x[eid];
//                     start.y = Transform.y[eid];
//                     dt.t = 0;
//                 },
//                 duration: windup_ms
//             }
//         },
//         {
//             at: windup_ms,
//             tween: {
//                 targets: dt,
//                 t: 1,
//                 onUpdate: () => {
//                     Transform.x[eid] = start.x + dx*thrust*dt.t;
//                     Transform.y[eid] = start.y + dy*thrust*dt.t;
//                 },
//                 onComplete: () => {
//                     dt.t = 0;
//                 },
//                 duration: thrust_ms
//             }
//         },
//         {
//             at: windup_ms,
//             run: () => {
//                 const WIDTH = 250;
//                 const flash = scene.add.rectangle(
//                     Transform.x[eid] + dx*WIDTH/2,
//                     Transform.y[eid] + dy*WIDTH/2,
//                     WIDTH,
//                     WIDTH,
//                     0xffffff
//                 )
                
//                 scene.add.tween({
//                     targets: flash,
//                     alpha: 0,
//                     duration: flash_ms,
//                     onUpdate: () => {
//                         flash.setPosition(
//                             Transform.x[eid] + dx*WIDTH/2,
//                             Transform.y[eid] + dy*WIDTH/2
//                         )
//                     },
//                     onComplete: () => {
//                         flash.destroy();
//                     }
//                 });
//             }
//         }
//     ]);

//     timeline.play();
// }