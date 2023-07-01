import { IWorld, addComponent, addEntity } from "bitecs";
import { Transform_Component } from "../componets/core/Transform_Component";
import { Rectangle_Component } from "../componets/render/Rectangle_Component";
import { Color_Component } from "../componets/render/Color_Component";

interface iProps {
    world: IWorld;
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
}

export const createRectangle_Prefab = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, Transform_Component, eid);
    Transform_Component.x[eid] = props.x;
    Transform_Component.y[eid] = props.y;

    addComponent(props.world, Rectangle_Component, eid);
    Rectangle_Component.width[eid] = props.width;
    Rectangle_Component.height[eid] = props.height;
    
    addComponent(props.world, Color_Component, eid);
    Color_Component.val[eid] = props.color;
}   