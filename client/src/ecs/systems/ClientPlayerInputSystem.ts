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

export interface IInput {
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
    let isMeleeAttack = false;

    const timer = new Timer();
    let accum = 0;
   

    return defineSystem((world: IWorld) => {

        // if (isMeleeAttack) return world;

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
        let norm = {x: 0, y: 0}

        if (w_key?.isDown) norm.y = -1;
        if (a_key?.isDown) norm.x = -1;
        if (s_key?.isDown) norm.y = 1;
        if (d_key?.isDown) norm.x = 1;

        norm = ArcUtils.Vector2.normalise(norm);

        // update (NOTE: there should only ever be one client input eid)
        onUpdate(world).forEach(eid => {
            

            const input: IInput = {
                move: {
                    dx: norm.x,
                    dy: norm.y,
                },
                key_release: {
                    l: l_release,
                    j: j_release,
                },
                dt_ms: timer.dt_ms > EMIT_INTERVAL_MS ? timer.dt_ms : EMIT_INTERVAL_MS,
                id: sequence_number++
            }

            if (!isMeleeAttack)
                room.send("client-input", input);

            // melee attack
            if (j_release) {
                meleeAttack(norm.x, norm.y, eid, scene, 500);
                isMeleeAttack = true;
                setTimeout(() => {
                    isMeleeAttack = false;
                }, 500)
            }
            
            // save data for dash render
            const x0 = Transform.position.x[eid];
            const y0 = Transform.position.y[eid];
            
            if (ClientPlayerInput.isClientSidePrediction[eid]) {
                // do client side prediction
                if (!isMeleeAttack)
                    applyInput(eid, input, true);

                saveBuffer(eid);
            }
            
            // add to pending inputs
            if (!isMeleeAttack)
            pending_inputs.push(input);
            
            // renderDash
            if (l_release) {
                console.log('l release');
                renderDash(x0, y0, Transform.position.x[eid], Transform.position.y[eid], scene);
            }
            
            
            l_release = false;
            j_release = false;
        });

        return world;
    });
}

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

}

const saveBuffer = (eid: number) => {
    // update position buffer
        position_buffer.push({
            x: Transform.position.x[eid],
            y: Transform.position.y[eid],
            timestamp: Date.now()
        });
        Interpolate.dt_ms[eid] = 0; // reset interpolation time
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

const meleeAttack = (dx: number, dy: number, eid: number, scene: Phaser.Scene, duration: number) => {
    const dt = {t: 0};

    const ogX = Transform.position.x[eid];
    const ogY = Transform.position.y[eid];

    scene.add.tween({
        targets: dt,
        t: 1,
        onUpdate: () => {
            Transform.position.x[eid] = ogX - dx * 150 * dt.t;
            Transform.position.y[eid] = ogY - dy * 150 * dt.t;
        },
        yoyo: true,
        duration: duration
    })
}