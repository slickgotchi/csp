import { Types, defineComponent } from "bitecs";


export const Transform = defineComponent({
    position: {
        x: Types.f32,
        y: Types.f32
    }
})