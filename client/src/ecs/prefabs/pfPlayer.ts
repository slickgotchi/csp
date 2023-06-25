import { IWorld, addComponent, addEntity } from "bitecs"
import { Transform } from "../componets/Transform";
import { Circle } from "../componets/Circle";
import { Color } from "../componets/Color";
import { Player } from "../componets/Player";
import { ServerMessage } from "../componets/ServerMessage";
import { Interpolate } from "../componets/Interpolate";
import { CircleCollider } from "../componets/CircleCollider";
import { ClientPlayerInput } from "../componets/ClientPlayerInput";
import { Room } from "colyseus.js";
import { IGameState } from "../../../../server/src/types/IGameState";
import { Schema } from '@colyseus/schema';
import { Collider, ColliderShape } from "../componets/collisions/Collider";
import { GA_RangedAttack } from "../componets/gas/gameplay-abillities/GA_RangedAttack";
import { GA_MeleeAttack } from "../componets/gas/gameplay-abillities/GA_MeleeAttack";
import { GA_Move } from "../componets/gas/gameplay-abillities/GA_Move";
import { GA_Null } from "../componets/gas/gameplay-abillities/GA_Null";
import { GA_Dash } from "../componets/gas/gameplay-abillities/GA_Dash";


interface iProps {
    room: Room<IGameState & Schema>;
    world: IWorld;
    serverEid: number;
    sessionId: string;
    x: number;
    y: number;
}


export const createPfPlayer = (props: iProps) => {
    const eid = addEntity(props.world);

    // addComponent(props.world, 'player', eid);

    addComponent(props.world, Player, eid);
    Player.speed[eid] = 400;

    if (props.room.sessionId === props.sessionId) {
        addComponent(props.world, ClientPlayerInput, eid);

        addComponent(props.world, ServerMessage, eid);
        ServerMessage.isServerReconciliation[eid] = 1;
        ServerMessage.serverEid[eid] = props.serverEid;
    } else {
        addComponent(props.world, ServerMessage, eid);
        ServerMessage.serverEid[eid] = props.serverEid;
    }


    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    addComponent(props.world, Interpolate, eid);

    addComponent(props.world, Circle, eid);
    Circle.radius[eid] = 50;
    
    addComponent(props.world, Color, eid);
    Color.val[eid] = 0x66ff66;

    addComponent(props.world, Collider, eid);
    Collider.shape[eid] = ColliderShape.Circle;
    Collider.radius[eid] = 50;
    Collider.isAutoStaticSeparate[eid] = 1;

    // abilities
    addComponent(props.world, GA_Null, eid);
    addComponent(props.world, GA_Move, eid);
    addComponent(props.world, GA_Dash, eid);
    addComponent(props.world, GA_MeleeAttack, eid);
    addComponent(props.world, GA_RangedAttack, eid);

    // addComponent(props.world, CircleCollider, eid);
    // CircleCollider.radius[eid] = 50;
}