


# GAS 

## ASC - Ability System Component
- for client player ASC's handles all the input messages
- handles state

## GA - Gameplay Ability
Defines:
- what an ability does
- what it costs
- under what conditions it can be used
- what tasks to activate
A GA is an instanced entity that can:
- run asynchronously
- run multi stage tasks like character anim, particles and sound effects
- have branches based on player input/interactions during its execution
- replicate itself across the network running on both client and server
GA's do not really work in a "tick" function and rely on their Ability Tasks to do most of the work
GA usage:
1. addComponent() a GA to target ASC
2. set the GA components cost, cooldown etc.
2. tryActivateAbility() to try run the ability
Tags can also be added such as:
- Cancel: cancels executing abilities with these tags while this ability executes
- Block: blocks abilities with these tags while this ability executes
etc.

## AT - Ability Task
These will run until they're finished executing or the containing GA ends.
Examples include:
- AT_Move: moves an Actor a given distance over given duration (defaul 0ms)
- AT_HitArea: create collider that acts as a "hit" projectile and logs hit events when impacting eid's of a given tag. has a duration that it is effective
- AT_ResolveStaticCollisions: checks for collisions against static objects and adjusts position to be not colliding

## GE - Gameplay Effect
- these modifiy AA's either instantly or over time
- these add status effect tags (sleep, confusion, blind etc.), usually for a duration

## AA - Actor Attribute

## GM - Gameplay Message
- these are passed around by GE, GA, AT and maybe ASC's?



everything a player object might do server side
- regen hp/ap
- be surrounded in a damaging aura (Game Ability?)
- melee attack (instantaneous)
- ranged attack (instantaneous or slow moving projectile)
- perform ultimate attack that does damage to random areas over time
- pick up health item
- trigger a damaging trap
- get a temporary stat buff

// events arising from player input
// - create fire ring that damages others (GA)
// - fire slow moving projectile (create projectile prefab)
// - fire instantaneous projectile (one frame box collision check)
// - instantaneous melee attack (GA)
// - instantaneous hp replenish to all those within range (GA)
// - invoke temporary stat buff (GE)

# 1 meleeAttack (Gameplay Ability)
- moveGameObject (Ability Task)
- broadcast meleeAttack to clients (Ability Task)
- createAttackCircleCollider (Ability Task) which leads to...
- getEntitiesInAttackCircle (Ability Task) which leads to...
- destroyEntity (Ability Task) which leads to...
- sendMessageAboutDestroyedEntity (Ability Task)



## Example flow

### GA_ClientInputMovement
1. AT_Move
2. AT_SeparateFromStaticColliders

### GA_MeleeAttack
1. AT_Move (dx,dy,duration)
2. AT_SeparateFromStaticColliders
3. AT_CreateDamageHitArea (duration, shape, )
4. 