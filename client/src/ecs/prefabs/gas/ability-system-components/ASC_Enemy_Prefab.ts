import { IWorld, addComponent, addEntity } from "bitecs";
import { ASC_Enemy_Component } from "../../../componets/gas/ability-system-components/ASC_Enemy_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";
import { Interpolate_Component } from "../../../componets/render/Interpolate_Component";
import { Circle_Component } from "../../../componets/render/Circle_Component";
import { ColliderShape, Collider_Component } from "../../../componets/collisions/Collider_Component";
import { Color_Component } from "../../../componets/render/Color_Component";


interface iProps {
    world: IWorld;
    serverEid: number;
    x: number;
    y: number;
}


export const createASC_Enemy_Prefab = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, ASC_Enemy_Component, eid);

    addComponent(props.world, Transform_Component, eid);
    Transform_Component.x[eid] = props.x;
    Transform_Component.y[eid] = props.y;

    addComponent(props.world, ServerMessage_Component, eid);
    ServerMessage_Component.serverEid[eid] = props.serverEid;

    addComponent(props.world, Interpolate_Component, eid);

    addComponent(props.world, Circle_Component, eid);
    Circle_Component.radius[eid] = 40;

    addComponent(props.world, Collider_Component, eid);
    Collider_Component.shape[eid] = ColliderShape.Circle;
    Collider_Component.radius[eid] = 40;
    
    addComponent(props.world, Color_Component, eid);
    Color_Component.val[eid] = 0xff6666;
}