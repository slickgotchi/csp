import { IWorld, addComponent, addEntity } from "bitecs";
import { Transform } from "../componets/Transform";
import { Circle } from "../componets/Circle";
import { Color } from "../componets/Color";

interface iProps {
    world: IWorld;
    x: number;
    y: number;
    radius: number;
    color: number;
}

export const createPfCircle = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, Transform, eid);
    Transform.position.x[eid] = props.x;
    Transform.position.y[eid] = props.y;

    addComponent(props.world, Circle, eid);
    Circle.radius[eid] = props.radius;
    
    addComponent(props.world, Color, eid);
    Color.val[eid] = props.color;
}   