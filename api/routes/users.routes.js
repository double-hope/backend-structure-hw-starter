import {db, statEmitter} from '../../index';
import {createPutUserSchema, createSchema} from '../../helpers/helpers';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import {checkValidation} from '../services/validation-service';
import {checkAuthorized} from "../middleware/authorized-handler";
import {returnNotAuthError} from "../services/return-error";
import joi from "joi";


const router = Router();

router
    .post('/', (req, res) => {
        const schema = createSchema();
        checkValidation(schema, req.body, res.status);

        if(res.statusCode === 400)
            return;

        req.body.balance = 0;

        db("user").insert(req.body).returning("*").then(([result]) => {
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
            res.send({
                error: err.detail
            });
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
                res.status(400).send({ error: isValidResult.error.details[0].message });
                return;
            }
            db("user").where('id', req.params.id).returning("*").then(([result]) => {
                if(!result) {
                    res.status(404).send({ error: 'User not found'});
                    return;
                }
                return res.send({
                    ...result,
                });
            });
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
    });



router
    .put('/:id', checkAuthorized, (req, res) => {
        let token = req.headers['authorization'];
        let tokenPayload;

        if(!req.authorize)
            return returnNotAuthError(res, 'Not Authorized');

        token = token.replace('Bearer ', '');

        try {
            tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return returnNotAuthError(res, 'Not Authorized');

        }

        const schema = createPutUserSchema();

        checkValidation(schema, req.body, res.status);

        if(res.statusCode === 400)
            return;

        if(req.params.id !== tokenPayload.id) {
            return returnNotAuthError(res, 'UserId mismatch');
        }
        db("user").where('id', req.params.id).update(req.body).returning("*").then(([result]) => {
            return res.send({
                ...result,
            });
        }).catch(err => {
            res.status(400).send({
                error: err.detail
            });

        });
    });

export default router;