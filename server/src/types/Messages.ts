let id = 1;

const getId = () => {
    return id++;
}

export const Message = {
    Player: {
        Dash: getId(),
        MeleeAttack: getId()
    }
}