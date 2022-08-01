import joi from "joi";

export const createSchema = () => {
    return joi.object({
        id: joi.string().uuid(),
        type: joi.string().required(),
        email: joi.string().email().required(),
        phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/).required(),
        name: joi.string().required(),
        city: joi.string(),
    }).required();
}

export const createUserSchema = () => {
    return joi.object({
        id: joi.string().uuid(),
        userId: joi.string().uuid().required(),
        cardNumber: joi.string().required(),
        amount: joi.number().min(0).required(),
    }).required();
}

export const createBetsSchema = () => {
    return joi.object({
        id: joi.string().uuid(),
        eventId: joi.string().uuid().required(),
        betAmount: joi.number().min(1).required(),
        prediction: joi.string().valid('w1', 'w2', 'x').required(),
    }).required();
}

export const createEventSchema = () => {
    return joi.object({
        id: joi.string().uuid(),
        type: joi.string().required(),
        homeTeam: joi.string().required(),
        awayTeam: joi.string().required(),
        startAt: joi.date().required(),
        odds: joi.object({
            homeWin: joi.number().min(1.01).required(),
            awayWin: joi.number().min(1.01).required(),
            draw: joi.number().min(1.01).required(),
        }).required(),
    }).required();
}

export const createScoreSchema = () => {
    return  joi.object({
        score: joi.string().required(),
    }).required();
}

export const createPutUserSchema = () => {
    return joi.object({
        email: joi.string().email(),
        phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/),
        name: joi.string(),
        city: joi.string(),
    }).required();
}