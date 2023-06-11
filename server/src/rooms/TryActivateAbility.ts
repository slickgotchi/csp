import { IWorld, addComponent, hasComponent } from "bitecs"
import { AT_Move } from "../ecs/components/gas/ability-tasks/AT_Move"
import { GA_Move } from "../ecs/components/gas/gameplay-abilities/GA_Move";
import { IInput, InputType } from "../messages/Messages";


const tryActivateAbilityGA_Move = (world: IWorld, eid: number, input: IInput) => {
    if (hasComponent(world, GA_Move, eid)) {
        addComponent(world, AT_Move, eid, false);
        AT_Move.dx[eid] += 400 * input.move.dx * input.dt_ms * 0.001;
        AT_Move.dy[eid] += 400 * input.move.dy * input.dt_ms * 0.001;
    }
}

export const tryActivateAbilityRoutes = {
    'GA_Move': tryActivateAbilityGA_Move
}

export const getInputTypeAbilityRouteString = (it: InputType) => {
    if (it === InputType.Move) return "GA_Move";

    return "";
}