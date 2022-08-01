import {db, statEmitter} from '../../index';
import {createPutUserSchema, createSchema} from '../../helpers/helpers';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import {checkValidation} from '../services/validation-service';
import {checkAuthorized} from '../middleware/authorized-handler';
import {returnError} from '../services/return-error';
import joi from 'joi';
import {findUser, usersService} from "../services/users-service";


const router = Router();

router
    .post('/', (req, res) => {
        checkValidation(createSchema(), req.body, res);

        if(res.statusCode === 400)
            return;

        usersService(req, res)
    });


router
    .put('/:id', (req, res) => {
        try {
            const schema = joi.object({
                id: joi.string().uuid(),
            }).required();

            checkValidation(schema, req.params, res);

            if(res.statusCode === 400)
                return;

            findUser(req, res);

        } catch (err) {
            returnError(res, 500, 'Internal Server Error');
        }
    });



router
    .put('/:id', checkAuthorized, (req, res) => {
        let token = req.headers['authorization'];
        let tokenPayload;

        if(!req.authorize)
            return returnError(res, 401, 'Not Authorized');

        token = token.replace('Bearer ', '');

        try {
            tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return returnError(res, 401, 'Not Authorized');

        }

        const schema = createPutUserSchema();

        checkValidation(schema, req.body, res);

        if(res.statusCode === 400)
            return;

        if(req.params.id !== tokenPayload.id) {
            return returnError(res, 401, 'UserId mismatch');
        }
        db('user').where('id', req.params.id).update(req.body).returning('*').then(([result]) => {
            return res.send({
                ...result,
            });
        }).catch(err => returnError(res, 400, err.detail));
    });

export default router;