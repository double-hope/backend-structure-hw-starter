import {Router} from "express";
import jwt from "jsonwebtoken";
import {stats} from "../../index";
import {checkAuthorized} from "../middleware/authorized-handler";
import {returnNotAuthError} from "../services/return-error";

const router = Router();

router
    .get("/", checkAuthorized, (req, res) => {
    try {

        if(!req.authorize) {
            return returnNotAuthError(res, 'Not Authorized');
        }

        const token = req.headers['authorization'].replace('Bearer ', '');

        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenPayload.type !== 'admin') {
                new Error();
            }
        } catch (err) {
            return returnNotAuthError(res, 'Not Authorized');
        }

        res.send(stats);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

export default router;