import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../index';
import { changeArrayElems, createUserSchema } from '../../helpers/helpers';
import { returnError } from '../services/return-error';
import { checkAuthorized } from '../middleware/authorized-handler';
import { checkValidation } from '../services/validation-service';
import {makeTransaction} from "../services/transaction-service";

const router = Router();

router
    .post('/', checkAuthorized, (req, res) => {
        const schema = createUserSchema();
        
        checkValidation(schema, req.body, res);

        if(res.statusCode === 400)
            return;
        
        if(!req.authorize) {
            return returnError(res, 401, 'Not Authorized');
        }

        let token = req.headers['authorization'].replace('Bearer ', '');
        
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenPayload.type !== 'admin') {
                new Error();
            }
        } catch (err) {
            return returnError(res, 401, 'Not Authorized');
        }

        db('user').where('id', req.body.userId).then(([user]) => {
            if(!user) {
                return returnError(res, 400, 'User does not exist');
            }

            return res.send(makeTransaction(req, user));
        }).catch(err => returnError(res, 500, 'Internal Server Error'));
    });

export default router;