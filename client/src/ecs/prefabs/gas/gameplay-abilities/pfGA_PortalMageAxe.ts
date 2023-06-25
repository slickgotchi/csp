import { IWorld, addComponent, addEntity } from "bitecs"
import { Sector } from "../../../componets/Sector";
import { Transform } from "../../../componets/Transform";
import { GA_PortalMageAxe } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe";

interface IProps {
    world: IWorld,
    x: number,
    y: number,
}


export const createPfGA_PortalMageAxe = (props: IProps) => {
    const eid = addEntity(props.world);

    addComponent(props.world, GA_PortalMageAxe, eid);

    addComponent(props.world, Transform, eid);

    addComponent(props.world, Sector, eid);
    Sector.radius[eid] = 300;
    Sector.angle[eid] = 90;
}