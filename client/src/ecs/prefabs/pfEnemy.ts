import { IWorld, addComponent, addEntity } from "bitecs"
import { Transform } from "../componets/Transform";
import { Circle } from "../componets/Circle";
import { Color } from "../componets/Color";
import { Interpolate } from "../componets/Interpolate";
import { CircleCollider } from "../componets/CircleCollider";
import { Enemy } from "../componets/Enemy";
import { ServerMessage } from "../componets/ServerMessage";


interface iProps {
    world: IWorld;
    serverEid: number;
    x: number;
    y: number;
}


export const createPfEnemy = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, Enemy, eid);

    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    addComponent(props.world, ServerMessage, eid);
    ServerMessage.serverEid[eid] = props.serverEid;

    addComponent(props.world, Interpolate, eid);

    addComponent(props.world, Circle, eid);
    Circle.radius[eid] = 40;
    
    addComponent(props.world, Color, eid);
    Color.val[eid] = 0xff6666;
}