let id = 1;

const getId = () => {
    return id++;
}

export const Message = {
    Player: {
        Move: getId(),
        Dash: getId(),
        MeleeAttack: getId(),
        RangedAttack: getId(),
        PortalMageAxe: getId(),
        MoveSpecial: getId(),
        TakeDamage: getId()
    },
    Enemy: {
        TakeDamage: getId(),
    }
}