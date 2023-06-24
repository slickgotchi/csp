import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs"
import { ArcUtils } from "../../utilities/ArcUtils";
import { Timer } from "../../utilities/Timer";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";

import { Room } from 'colyseus.js';

import * as Collisions from 'detect-collisions';
import { Interpolate } from "../componets/Interpolate";
import { ClientPlayerInput } from "../componets/ClientPlayerInput";
import { positionBufferByEid, saveBuffer } from "./InterpolateSystem";
import { ArcCircleCollider, collidersByEid, separateFromStaticColliders } from "./collisions/ColliderSystem";
import { tintFlash } from "./server-message/routes/EnemyTakeDamageRoute";
import { Enemy } from "../componets/Enemy";
import { playRangedAttackAnim, tryActivateGA_RangedAttack } from "./gas/gameplay-abilities/GA_RangedAttackSystem";
import { tryActivateGA_MeleeAttack } from "./gas/gameplay-abilities/GA_MeleeAttackSystem";
import { tryActivateGA_Move } from "./gas/gameplay-abilities/GA_MoveSystem";
import { tryActivateGA_Dash } from "./gas/gameplay-abilities/GA_DashSystem";

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
    targetGA: string,
    dir: {
        x: number,
        y: number,
    },
    key_release: {
        l: boolean,
        j: boolean,
        k: boolean,
    },
    dt_ms: number,
    id: number,
}

export const pending_inputs: IInput[] = [];
export let sequence_number = 0;
const EMIT_INTERVAL_MS = 100;

export const createClientPlayerInputSystem = (scene: Phaser.Scene, room: Room, collisions: Collisions.System) => {

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
    let dir = { x: 0, y: 1 }

    // define system
    return defineSystem((world: IWorld) => {

        // update time
        timer.tick();

        // only do input as per our emit interval frequency
        accum += timer.dt_ms;
        if (accum < EMIT_INTERVAL_MS) {
            return world;
        } else {
            accum -= EMIT_INTERVAL_MS;
        }

        // calc move direction vector and normalize it
        if (w_key?.isDown || a_key?.isDown || s_key?.isDown || d_key?.isDown) dir = {x:0,y:0}
        if (w_key?.isDown) dir.y = -1;
        if (a_key?.isDown) dir.x = -1;
        if (s_key?.isDown) dir.y = 1;
        if (d_key?.isDown) dir.x = 1;
        dir = ArcUtils.Vector2.normalise(dir);

        // update (NOTE: there should only ever be one client input eid)
        onUpdate(world).forEach(eid => {
            // determine target game ability based on key presses
            let targetGA = "GA_Idol";
            if (w_key?.isDown || a_key?.isDown || s_key?.isDown || d_key?.isDown) { targetGA = "GA_Move"; }
            if (l_release) { targetGA = "GA_Dash"; }
            if (j_release) { targetGA = "GA_MeleeAttack"; } 
            if (k_release) { targetGA = "GA_RangedAttack"; }

            // create an input
            const input: IInput = {
                targetGA: targetGA,
                dir: {
                    x: dir.x,
                    y: dir.y,
                },
                key_release: {
                    l: l_release,
                    j: j_release,
                    k: k_release,
                },
                dt_ms: timer.dt_ms > EMIT_INTERVAL_MS ? timer.dt_ms : EMIT_INTERVAL_MS,
                id: sequence_number++
            }

            // update server with latest input
            room.send("client-input", input);

            // try activate gameplay ability
            const tryActivateGA = (tryActivateGA_Routes as any)[targetGA];
            tryActivateGA(eid, input);
            
            // reset key status'
            j_release = false;
            k_release = false;
            l_release = false;
        });

        return world;
    });
}

export const tryActivateGA_Routes = {
    "GA_Idol": tryActivateGA_Move,  // move knows how to handle idols
    'GA_Move': tryActivateGA_Move,
    "GA_Dash": tryActivateGA_Dash,
    "GA_MeleeAttack": tryActivateGA_MeleeAttack,
    "GA_RangedAttack": tryActivateGA_RangedAttack,
}


