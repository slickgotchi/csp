let id = 1;

const getID = () => {
    return id++;
}

export const Message = {
    PlayerDash: getID()
}