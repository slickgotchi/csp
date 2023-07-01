import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import { ClientPlayerInput_Component } from "../../componets/input/ClientPlayerInput_Component";
import { GameScene } from "../../../scenes/GameScene";
import { ASC_Player_Component } from "../../componets/gas/ability-system-components/ASC_Player_Component";
import { Transform_Component } from "../../componets/core/Transform_Component";
import { Timer } from "../../../utilities/Timer";
import { ArcUtils } from "../../../utilities/ArcUtils";
import { Sector_Component } from "../../componets/render/Sector_Component";
import { tryActivateGA_Null } from "../gas/gameplay-abilities/GA_Null_System";
import { collidersByEid, separateFromStaticColliders } from "../collisions/Collider_System";
import { saveBuffer } from "../render/Interpolate_System";
import { tryActivateGA_Move } from "../gas/gameplay-abilities/GA_Move_System";
import { tryActivateGA_Dash } from "../gas/gameplay-abilities/GA_Dash_System";
import { tryActivateGA_MeleeAttack } from "../gas/gameplay-abilities/GA_MeleeAttack_System";
import { tryActivateGA_RangedAttack } from "../gas/gameplay-abilities/GA_RangedAttack_System";
import { tryActivateGA_PortalMageAxe } from "../gas/gameplay-abilities/GA_PortalMageAxe_System";

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
        u: boolean,
    },
    dt_ms: number,
    id: number,
}

export const pending_inputs: IInput[] = [];
export let sequence_number = 0;
const EMIT_INTERVAL_MS = 100;

export const createClientPlayerInput_System = (gScene: GameScene) => {

    const onUpdate = defineQuery([ClientPlayerInput_Component, ASC_Player_Component, Transform_Component]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    const w_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const a_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const s_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const d_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    const l_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    let l_release = false;
    l_key?.on('up', () => { l_release = true; });

    const j_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    let j_release = false;
    j_key?.on('up', () => { j_release = true; });

    const k_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    let k_release = false;
    k_key?.on('up', () => { k_release = true; });

    const u_key = gScene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    let u_release = false;
    u_key?.on('up', () => { u_release = true; });

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
            // update sector angle for portal mage axe targeting
            const angle = ArcUtils.Angle.fromVector2(dir);
            Sector_Component.angle[eid] = angle - 90;
            Sector_Component.visible[eid] = u_key?.isDown ? 1 : 0;

            // determine target game ability based on key presses
            let targetGA = "GA_Null";
            if (w_key?.isDown || a_key?.isDown || s_key?.isDown || d_key?.isDown) { targetGA = "GA_Move"; }
            if (l_release) { targetGA = "GA_Dash"; }
            if (j_release) { targetGA = "GA_MeleeAttack"; } 
            if (k_release) { targetGA = "GA_RangedAttack"; }  // note there will be a pause in movement if these abilities fail later
            if (u_release) { targetGA = "GA_PortalMageAxe"; }

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
                    u: u_release,
                },
                // dt_ms: timer.dt_ms > EMIT_INTERVAL_MS ? timer.dt_ms : EMIT_INTERVAL_MS,
                dt_ms: EMIT_INTERVAL_MS,
                id: sequence_number++
            }

            // try activate gameplay ability
            const tryActivateGA = (tryActivateGA_Routes as any)[targetGA];
            if (!tryActivateGA(eid, input)) {
                input.targetGA = "GA_Null";
                tryActivateGA_Null(eid, input);
            }

            // update server with latest input
            gScene.room.send("client-input", input);
            
            // reset key status'
            j_release = false;
            k_release = false;
            l_release = false;
            u_release = false;
        });

        return world;
    });
}

// movePlayer() call this function in abilities
export const movePlayer = (gScene: GameScene, eid: number, dx: number, dy: number, checkCollisions: boolean = true) => {
    // 1. update transform
    Transform_Component.x[eid] += dx;
    Transform_Component.y[eid] += dy;

    // 1b. update for colliders
    if (checkCollisions) {
        separateFromStaticColliders(eid, collidersByEid.get(eid));
    }

    // 2. create an input
    const input = createMovePlayerInput(dx, dy);

    // 3. add to inputs
    pending_inputs.push(input);

    // 4. save buffer
    saveBuffer(gScene.room, eid);
}

// called by move player
export const createMovePlayerInput = (dx: number, dy: number) => {
    const input: IInput = {
        targetGA: "GA_MovePlayer",
        dir: {
            x: dx,
            y: dy,
        },
        key_release: {
            l: false,
            j: false,
            k: false,
            u: false,
        },
        dt_ms: 0,
        id: sequence_number++
    }
    return input;
}

// this get called during server reconciliation
export const applyMovePlayerInput = (eid: number, input: IInput) => {
    Transform_Component.x[eid] += input.dir.x;
    Transform_Component.y[eid] += input.dir.y;

    separateFromStaticColliders(eid, collidersByEid.get(eid));
}

export const tryActivateGA_Routes = {
    "GA_Null": tryActivateGA_Null,
    'GA_Move': tryActivateGA_Move,
    "GA_Dash": tryActivateGA_Dash,
    "GA_MeleeAttack": tryActivateGA_MeleeAttack,
    "GA_RangedAttack": tryActivateGA_RangedAttack,
    "GA_PortalMageAxe": tryActivateGA_PortalMageAxe
}



