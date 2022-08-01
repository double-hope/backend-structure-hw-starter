import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { stats } from '../../index';
import { checkAuthorized } from '../middleware/authorized-handler';
import { returnError } from '../services/return-error';

const router = Router();

router
    .get('/', checkAuthorized, (req, res) => {
    try {

        if(!req.authorize) {
            return returnError(res, 401, 'Not Authorized');
        }

        const token = req.headers['authorization'].replace('Bearer ', '');

        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenPayload.type !== 'admin') {
                new Error();
            }
        } catch (err) {
            return returnError(res, 401, 'Not Authorized');
        }

        res.send(stats);
    } catch (err) {
        returnError(res, 500, 'Internal Server Error');
    }
});

export default router;