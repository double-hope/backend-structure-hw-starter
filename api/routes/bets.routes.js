import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createBetsSchema } from '../../helpers/helpers';
import { checkValidation } from '../services/validation-service';
import { returnError } from '../services/return-error';
import { betsService } from "../services/bets-service";

const router = Router();

router
    .post('/', (req, res) => {
    const schema = createBetsSchema();
    checkValidation(schema, req.body, res);

    if(res.statusCode === 400)
        return;

    let userId;
    try {
        let token = req.headers['authorization'];
        
        if(!token) {
            return returnError(res, 401, 'Not Authorized');
        }
        
        token = token.replace('Bearer ', '');
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            userId = tokenPayload.id;
        } catch (err) {
            console.log(err);
            return res.status(401).send({ error: 'Not Authorized' });
        }

        betsService(req, res, userId);
    } catch (err) {
        returnError(res, 500, 'Internal Server Error');
    }
});

export default router;