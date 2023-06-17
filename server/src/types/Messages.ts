let id = 1;

const getId = () => {
    return id++;
}

export const Message = {
    Player: {
        Dash: getId(),
        MeleeAttack: getId(),
        RangedAttack: getId(),
        TakeDamage: getId()
    },
    Enemy: {
        TakeDamage: getId(),
    }
}