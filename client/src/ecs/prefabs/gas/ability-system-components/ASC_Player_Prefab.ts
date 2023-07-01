

import { IWorld, addComponent, addEntity } from "bitecs"
import { IGameState } from "../../../../../../server/src/types/IGameState";
import { Schema } from '@colyseus/schema';
import { Room } from "colyseus.js";
import { ASC_Player_Component } from "../../../componets/gas/ability-system-components/ASC_Player_Component";
import { ClientPlayerInput_Component } from "../../../componets/input/ClientPlayerInput_Component";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { Interpolate_Component } from "../../../componets/render/Interpolate_Component";
import { Circle_Component } from "../../../componets/render/Circle_Component";
import { Color_Component } from "../../../componets/render/Color_Component";
import { ColliderShape, Collider_Component } from "../../../componets/collisions/Collider_Component";
import { GA_Null_Component } from "../../../componets/gas/gameplay-abillities/GA_Null_Component";
import { GA_Move_Component } from "../../../componets/gas/gameplay-abillities/GA_Move_Component";
import { GA_Dash_Component } from "../../../componets/gas/gameplay-abillities/GA_Dash_Component";
import { GA_MeleeAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_MeleeAttack_Component";
import { GA_RangedAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack_Component";
import { GA_PortalMageAxe_Component } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe_Component";
import { Sector_Component } from "../../../componets/render/Sector_Component";


interface iProps {
    room: Room<IGameState & Schema>;
    world: IWorld;
    serverEid: number;
    sessionId: string;
    x: number;
    y: number;
}


export const createASC_Player_Prefab = (props: iProps) => {
    const eid = addEntity(props.world);

    // addComponent(props.world, 'player', eid);

    addComponent(props.world, ASC_Player_Component, eid);
    ASC_Player_Component.speed[eid] = 400;

    if (props.room.sessionId === props.sessionId) {
        addComponent(props.world, ClientPlayerInput_Component, eid);

        addComponent(props.world, ServerMessage_Component, eid);
        ServerMessage_Component.isServerReconciliation[eid] = 1;
        ServerMessage_Component.serverEid[eid] = props.serverEid;
    } else {
        addComponent(props.world, ServerMessage_Component, eid);
        ServerMessage_Component.serverEid[eid] = props.serverEid;
    }


    addComponent(props.world, Transform_Component, eid);
    Transform_Component.x[eid] = props.x;
    Transform_Component.y[eid] = props.y;

    addComponent(props.world, Interpolate_Component, eid);

    addComponent(props.world, Circle_Component, eid);
    Circle_Component.radius[eid] = 50;
    
    addComponent(props.world, Color_Component, eid);
    Color_Component.val[eid] = 0x66ff66;

    addComponent(props.world, Collider_Component, eid);
    Collider_Component.shape[eid] = ColliderShape.Circle;
    Collider_Component.radius[eid] = 50;
    Collider_Component.isAutoStaticSeparate[eid] = 1;

    // abilities
    addComponent(props.world, GA_Null_Component, eid);
    addComponent(props.world, GA_Move_Component, eid);
    addComponent(props.world, GA_Dash_Component, eid);
    addComponent(props.world, GA_MeleeAttack_Component, eid);
    addComponent(props.world, GA_RangedAttack_Component, eid);
    addComponent(props.world, GA_PortalMageAxe_Component, eid);

    // add sector here for now for diplay
    addComponent(props.world, Sector_Component, eid);
    Sector_Component.radius[eid] = 500;
    Sector_Component.spreadDegrees[eid] = 60;
    Sector_Component.angle[eid] = 0;
    Sector_Component.alpha[eid] = 0.5;
    Sector_Component.visible[eid] = 0;

    // addComponent(props.world, CircleCollider, eid);
    // CircleCollider.radius[eid] = 50;
}