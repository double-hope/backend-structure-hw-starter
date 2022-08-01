import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createEventSchema, createScoreSchema } from '../../helpers/helpers';
import { returnError } from '../services/return-error';
import { checkAuthorized } from '../middleware/authorized-handler';
import { checkValidation } from "../services/validation-service";
import { eventPostService, eventPutService } from "../services/event-service";

const router = Router();

router
    .post('/', checkAuthorized, (req, res) => {
        const schema = createEventSchema();
        checkValidation(schema, req.body, res);

        if(res.statusCode === 400)
            return;

        try {
            let token = req.headers['authorization'];
            if(!req.authorize) {
                return returnError(res, 401, 'Not Authorized');
            }
            token = token.replace('Bearer ', '');
            try {
                const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
                if (tokenPayload.type !== 'admin') {
                    new Error();
                }
            } catch (err) {
                return returnError(res, 401, 'Not Authorized');
            }

            eventPostService(req, res);
        } catch (err) {
            returnError(res, 500, 'Internal Server Error');
        }
    });

router
    .put('/:id', (req, res) => {
        const schema = createScoreSchema();

        checkValidation(schema, req.body, res);

        if(res.statusCode === 400)
            return;

        try {
            let token = req.headers['authorization'];

            if(!token) {
                return returnError(res, 401, 'Not Authorized');
            }

            token = token.replace('Bearer ', '');
            try {
                const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
                if (tokenPayload.type !== 'admin') {
                    new Error();
                }
            } catch (err) {
                return returnError(res, 401, 'Not Authorized');
            }

            eventPutService(req, res);
        } catch (err) {
            returnError(res, 500, 'Internal Server Error');
        }
    });

export default router;