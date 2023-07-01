import { IWorld, addComponent, addEntity } from "bitecs";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";
import { Rectangle_Component } from "../../../componets/render/Rectangle_Component";
import { ColliderShape, Collider_Component } from "../../../componets/collisions/Collider_Component";
import { Color_Component } from "../../../componets/render/Color_Component";


interface iProps {
    world: IWorld;
    serverEid: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
}


export const createASC_Obstacle_Prefab = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, Transform_Component, eid);
    Transform_Component.x[eid] = props.x;
    Transform_Component.y[eid] = props.y;

    addComponent(props.world, ServerMessage_Component, eid);
    ServerMessage_Component.serverEid[eid] = props.serverEid;

    addComponent(props.world, Rectangle_Component, eid);
    Rectangle_Component.width[eid] = props.width;
    Rectangle_Component.height[eid] = props.height;

    addComponent(props.world, Collider_Component, eid);
    Collider_Component.shape[eid] = ColliderShape.Box;
    Collider_Component.width[eid] = props.width;
    Collider_Component.height[eid] = props.height;
    Collider_Component.isStatic[eid] = 1;
    
    addComponent(props.world, Color_Component, eid);
    Color_Component.val[eid] = props.color;
}