import { IWorld, addComponent, addEntity } from "bitecs"
import { Transform } from "../componets/Transform";
import { Circle } from "../componets/Circle";
import { Color } from "../componets/Color";
import { Interpolate } from "../componets/Interpolate";
import { CircleCollider } from "../componets/CircleCollider";
import { Enemy } from "../componets/Enemy";
import { ServerMessage } from "../componets/ServerMessage";
import { Rectangle } from "../componets/Rectangle";
import { BoxCollider } from "../componets/BoxCollider";


interface iProps {
    world: IWorld;
    serverEid: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
}


export const createPfObstacle = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    addComponent(props.world, ServerMessage, eid);
    ServerMessage.serverEid[eid] = props.serverEid;

    addComponent(props.world, Rectangle, eid);
    Rectangle.width[eid] = props.width;
    Rectangle.height[eid] = props.height;

    addComponent(props.world, BoxCollider, eid);
    BoxCollider.width[eid] = props.width;
    BoxCollider.height[eid] = props.height;
    
    addComponent(props.world, Color, eid);
    Color.val[eid] = props.color;
}