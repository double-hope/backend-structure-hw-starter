import {db, statEmitter} from '../../index';
import {createPutUserSchema, createSchema} from '../../helpers/helpers';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import {checkValidation} from '../services/validation-service';
import {checkAuthorized} from '../middleware/authorized-handler';
import {returnError} from '../services/return-error';
import joi from 'joi';


const router = Router();

router
    .post('/', (req, res) => {
        const schema = createSchema();
        checkValidation(schema, req.body, res);

        if(res.statusCode === 400)
            return;

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
    });


router
    .put('/:id', (req, res) => {
        try {
            const schema = joi.object({
                id: joi.string().uuid(),
            }).required();
            const isValidResult = schema.validate(req.params);
            if(isValidResult.error) {
                return returnError(res, 400, isValidResult.error.details[0].message);
            }
            db('user').where('id', req.params.id).returning('*').then(([result]) => {
                if(!result) {
                    return returnError(res, 404,  'User not found');
                }
                return res.send({
                    ...result,
                });
            });
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