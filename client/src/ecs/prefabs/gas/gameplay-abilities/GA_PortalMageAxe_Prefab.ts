import { IWorld, addComponent, addEntity } from "bitecs";
import { GA_PortalMageAxe_Component } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { Sector_Component } from "../../../componets/render/Sector_Component";

interface IProps {
    world: IWorld,
    x: number,
    y: number,
}


export const createGA_PortalMageAxe_Prefab = (props: IProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, GA_PortalMageAxe_Component, eid);

    addComponent(props.world, Transform_Component, eid);

    addComponent(props.world, Sector_Component, eid);
    Sector_Component.radius[eid] = 300;
    Sector_Component.angle[eid] = 90;
}