import { IWorld, defineSystem } from 'bitecs';
import * as Collisions from 'detect-collisions';


export const createCollisionsSystem = () => {


    return defineSystem((world: IWorld) => {

        return world;
    });
}