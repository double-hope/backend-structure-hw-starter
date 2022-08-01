import {db, statEmitter} from "../../index";
import {changeArrayElems} from "../../helpers/arrayHelper";
import {returnError} from "./return-error";

export const betsService = (req, res, userId) => {
    req.body.event_id = req.body.eventId;
    req.body.bet_amount = req.body.betAmount;
    delete req.body.eventId;
    delete req.body.betAmount;
    req.body.user_id = userId;

    db.select().table('user').then((users) => {
        const user = users.find(u => u.id === userId);
        if(!user)
            return returnError(res, 400, 'User does not exist');

        if(+user.balance < +req.body.bet_amount)
            return returnError(res, 400, 'Not enough balance');

        db('event').where('id', req.body.event_id).then(([event]) => {
            if(!event)
                return returnError(res, 404, 'Event not found');

            db('odds').where('id', event.odds_id).then(([odds]) => {
                if(!odds)
                    return returnError(res, 404, 'Odds not found');

                let multiplier;
                switch(req.body.prediction) {
                    case 'w1':
                        multiplier = odds.home_win;
                        break;
                    case 'w2':
                        multiplier = odds.away_win;
                        break;
                    case 'x':
                        multiplier = odds.draw;
                        break;
                }
                db('bet').insert({
                    ...req.body,
                    multiplier,
                    event_id: event.id
                }).returning('*').then(([bet]) => {
                    const currentBalance = user.balance - req.body.bet_amount;
                    db('user').where('id', userId).update({
                        balance: currentBalance,
                    }).then(() => {
                        statEmitter.emit('newBet');
                        ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at', 'user_id'].forEach(key => {
                            bet = changeArrayElems(bet, key);
                        });
                        return res.send({
                            ...bet,
                            currentBalance: currentBalance,
                        });
                    });
                });
            });
        });
    });
}