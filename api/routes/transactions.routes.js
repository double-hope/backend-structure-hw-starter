import {Router} from "express";
import jwt from "jsonwebtoken";
import {db} from "../../index";
import {changeArrayElems, createUserSchema} from "../../helpers/helpers";
import {returnNotAuthError} from "../services/return-error";
import {checkAuthorized} from "../middleware/authorized-handler";

const router = Router();

router
    .post("/", checkAuthorized, (req, res) => {
        const schema = createUserSchema();
        const isValidResult = schema.validate(req.body);

        if(isValidResult.error) {
            res.status(400).send({ error: isValidResult.error.details[0].message });
            return;
        }

        let token = req.headers['authorization'];
        if(!req.authorize) {
            return returnNotAuthError(res, 'Not Authorized');
        }

        token = token.replace('Bearer ', '');
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenPayload.type !== 'admin') {
                new Error();
            }
        } catch (err) {
            return returnNotAuthError(res, 'Not Authorized');
        }

        db("user").where('id', req.body.userId).then(([user]) => {
            if(!user) {
                res.status(400).send({ error: 'User does not exist'});
                return;
            }
            req.body.card_number = req.body.cardNumber;
            delete req.body.cardNumber;
            req.body.user_id = req.body.userId;
            delete req.body.userId;
            db("transaction").insert(req.body).returning("*").then(([result]) => {
                const currentBalance = req.body.amount + user.balance;
                db("user").where('id', req.body.user_id).update('balance', currentBalance).then(() => {
                    ['user_id', 'card_number', 'created_at', 'updated_at'].forEach(key => {
                        result = changeArrayElems(result, key);
                    })
                    return res.send({
                        ...result,
                        currentBalance,
                    });
                });
            });
        }).catch(err => {
            res.status(500).send("Internal Server Error");
        });
    });

export default router;