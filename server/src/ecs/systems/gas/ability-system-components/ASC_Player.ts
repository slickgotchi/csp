/*
The Ability System Component is the main interface through which your 
game's characters will access the Gameplay Ability System. This 
Component manages Gameplay Attributes, runs Gameplay Events, stores 
Gameplay Abilities, and even handles binding player input to Gameplay 
Ability activation, confirmation, and cancelation commands. Any Actor 
that is intended to interact with the Gameplay Ability System should 
have an Ability System Component.
https://docs.unrealengine.com/4.26/en-US/InteractiveExperiences/GameplayAbilitySystem/
*/

import { IWorld, defineSystem } from "bitecs"

export const createASC_PlayerSystem = () => {


    return defineSystem((world: IWorld) => {

        return world;
    });
}