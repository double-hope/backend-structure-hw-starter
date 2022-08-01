import {db, statEmitter} from "../../index";
import jwt from "jsonwebtoken";
import {returnError} from "./return-error";

export const usersService = (req, res) => {
    req.body.balance = 0;
    db('user').insert(req.body).returning('*').then(([result]) => {
        result.createdAt = result.created_at;
        delete result.created_at;
        result.updatedAt = result.updated_at;
        delete result.updated_at;
        statEmitter.emit('newUser');
        return res.send({
            ...result,
            accessToken: jwt.sign({ id: result.id, type: result.type }, process.env.JWT_SECRET)
        });
    }).catch(err => {
        returnError(res, err.status, err.detail);
    });
}

export const findUser = (req, res) => {
    db('user').where('id', req.params.id).returning('*').then(([result]) => {
        if(!result) {
            return returnError(res, 404,  'User not found');
        }
        return res.send({
            ...result,
        });
    });
}