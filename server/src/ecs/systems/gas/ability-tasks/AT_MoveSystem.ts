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
            AT_Move.timer_ms[eid] += timer.dt_ms;

            if (AT_Move.duration_ms[eid] <= 0) {
                Transform.x[eid] += AT_Move.dx[eid];
                Transform.y[eid] += AT_Move.dy[eid];
                removeComponent(world, AT_Move, eid);
            } else {
                if (AT_Move.timer_ms[eid] <= AT_Move.duration_ms[eid]) {
                    const interp = timer.dt_ms / AT_Move.duration_ms[eid];
                    Transform.x[eid] += AT_Move.dx[eid] * interp;
                    Transform.y[eid] += AT_Move.dy[eid] * interp;
                } else {
                    removeComponent(world, AT_Move, eid);
                }
            }
        });

        return world;
    })
}