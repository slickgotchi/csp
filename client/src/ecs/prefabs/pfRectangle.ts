import { IWorld, addComponent, addEntity } from "bitecs";
import { Transform } from "../componets/Transform";
import { Color } from "../componets/Color";
import { Rectangle } from "../componets/Rectangle";

interface iProps {
    world: IWorld;
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
}

export const createPfCircle = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    addComponent(props.world, Rectangle, eid);
    Rectangle.width[eid] = props.width;
    Rectangle.height[eid] = props.height;
    
    addComponent(props.world, Color, eid);
    Color.val[eid] = props.color;
}   