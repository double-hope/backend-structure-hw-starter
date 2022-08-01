import { db } from '../../index';
import { changeArrayElems } from '../../helpers/arrayHelper';

export const makeTransaction = (req, user) => {
    req.body.card_number = req.body.cardNumber;
    delete req.body.cardNumber;
    req.body.user_id = req.body.userId;
    delete req.body.userId;
    db('transaction').insert(req.body).returning('*').then(([result]) => {
        const currentBalance = req.body.amount + user.balance;
        db('user').where('id', req.body.user_id).update('balance', currentBalance).then(() => {
            ['user_id', 'card_number', 'created_at', 'updated_at'].forEach(key => {
                result = changeArrayElems(result, key);
            })
            return {
                ...result,
                currentBalance,
            };
        });
    });
}