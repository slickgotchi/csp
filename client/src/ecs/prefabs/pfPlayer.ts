import { IWorld, addComponent, addEntity } from "bitecs"
import { Transform } from "../componets/Transform";
import { Circle } from "../componets/Circle";
import { Color } from "../componets/Color";
import { Player } from "../componets/Player";
import { ServerMessage } from "../componets/ServerMessage";
import { Interpolate } from "../componets/Interpolate";
import { CircleCollider } from "../componets/CircleCollider";
import { ClientPlayerInput } from "../componets/ClientPlayerInput";


interface iProps {
    world: IWorld;
    serverEid: number;
    x: number;
    y: number;
}


export const createPfPlayer = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, 'player', eid);

    addComponent(props.world, Player, eid);
    Player.speed[eid] = 400;

    addComponent(props.world, ClientPlayerInput, eid);
    ClientPlayerInput.isClientSidePrediction[eid] = 1;

    addComponent(props.world, ServerMessage, eid);
    ServerMessage.isServerReconciliation[eid] = 1;
    ServerMessage.serverEid[eid] = props.serverEid;

    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    addComponent(props.world, Interpolate, eid);

    addComponent(props.world, Circle, eid);
    Circle.radius[eid] = 50;
    
    addComponent(props.world, Color, eid);
    Color.val[eid] = 0x66ff66;

    addComponent(props.world, CircleCollider, eid);
    CircleCollider.radius[eid] = 50;
}