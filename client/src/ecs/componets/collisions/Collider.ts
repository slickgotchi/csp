import { Types, defineComponent } from "bitecs";

export enum ColliderShape {
    Circle,
    Box,
    Polygon
}

export const Collider = defineComponent({
    // type of collider
    shape: Types.ui8,

    // general properties
    isStatic: Types.ui8,
    isTrigger: Types.ui8,
    isAutoStaticSeparate: Types.ui8,  // auto separation from static colliders

    // circle
    radius: Types.f32,

    // box
    width: Types.f32,
    height: Types.f32

    // polygon
    // TO BE ADDED
});