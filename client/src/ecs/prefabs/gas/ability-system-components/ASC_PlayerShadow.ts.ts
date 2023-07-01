import { IWorld, addComponent, addEntity } from "bitecs";
import { ASC_Player_Component } from "../../../componets/gas/ability-system-components/ASC_Player_Component";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { Circle_Component } from "../../../componets/render/Circle_Component";
import { Color_Component } from "../../../componets/render/Color_Component";


interface iProps {
    world: IWorld;
    serverEid: number;
    x: number;
    y: number;
}


export const createASC_PlayerShadow_Prefab = (props: iProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, ASC_Player_Component, eid);
    ASC_Player_Component.speed[eid] = 400;

    addComponent(props.world, ServerMessage_Component, eid);
    ServerMessage_Component.isServerReconciliation[eid] = 0;
    ServerMessage_Component.serverEid[eid] = props.serverEid;

    addComponent(props.world, Transform_Component, eid);
    Transform_Component.x[eid] = props.x;
    Transform_Component.y[eid] = props.y;

    addComponent(props.world, Circle_Component, eid);
    Circle_Component.radius[eid] = 50;
    
    addComponent(props.world, Color_Component, eid);
    Color_Component.val[eid] = 0x0F8A0F;
}