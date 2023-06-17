import { IWorld, defineQuery, defineSystem, removeComponent } from "bitecs"
import { AT_Move } from "../../../components/gas/ability-tasks/AT_Move"
import { Timer } from "../../../../utilities/Timer";
import { Transform } from "../../../components/Transform";


export const createAT_MoveSystem = () => {
    const onUpdate = defineQuery([AT_Move]);

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        onUpdate(world).forEach(eid => {
            AT_Move.duration_ms[eid] -= timer.dt_ms;

            if (AT_Move.duration_ms[eid] > 0) {
                Transform.x[eid] += AT_Move.vx[eid] * timer.dt_ms * 0.001;
                Transform.y[eid] += AT_Move.vy[eid] * timer.dt_ms * 0.001;
            } else {
                removeComponent(world, AT_Move, eid);
            }
        });

        return world;
    })
}