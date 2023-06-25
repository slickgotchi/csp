import { IWorld, addComponent, addEntity } from "bitecs";
import { Room } from "colyseus";
import * as Collisions from 'detect-collisions';
import { sPlayer } from "../../../../types/sPlayer";
import { Sync } from "../../../components/Sync";
import { Transform } from "../../../components/Transform";
import { ASC_Player } from "../../../components/gas/ability-system-components/ASC_Player";
import { Collider, ColliderShape } from "../../../components/collisions/Collider";
import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { GA_Move } from "../../../components/gas/gameplay-abilities/GA_Move";
import { GA_MeleeAttack } from "../../../components/gas/gameplay-abilities/GA_MeleeAttack";
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";
import { GA_Null } from "../../../components/gas/gameplay-abilities/GA_Null";

interface IProps {
    room: Room;
    world: IWorld;
    system: Collisions.System;
    sessionId: string;
    x: number;
    y: number;
}

export const createPf_ASC_Player = (props: IProps) => {
    const eid = addEntity(props.world);

    // create the game object
    const playerGo = new sPlayer({
        serverEid: eid,
        sessionId: props.sessionId,
        x: props.x,
        y: props.y,
    });
    props.room.state.gameObjects.set(eid.toString(), playerGo);

    // add asc player component
    addComponent(props.world, ASC_Player, eid);

    // transform
    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    // collider
    addComponent(props.world, Collider, eid);
    Collider.shape[eid] = ColliderShape.Circle;
    Collider.radius[eid] = 50;
    Collider.isAutoStaticSeparate[eid] = 1;

    // add sync component
    addComponent(props.world, Sync, eid);

    // gameplay abilities
    addComponent(props.world, GA_Null, eid);
    addComponent(props.world, GA_Move, eid);
    addComponent(props.world, GA_Dash, eid);
    addComponent(props.world, GA_MeleeAttack, eid);
    addComponent(props.world, GA_RangedAttack, eid);

    return eid;
}