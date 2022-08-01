import express from 'express';
import knex from 'knex';
const ee = require('events');
import routes from './api/routes/index';
const dbConfig = require("./knexfile");
export const app = express();

const port = 3000;
export const statEmitter = new ee();
export let db;
export const stats = {
  totalUsers: 3,
  totalBets: 1,
  totalEvents: 1,
};

app.use(express.json());

routes(app);

app.use((req, res, next) => {
    db = knex(dbConfig.development);
    db.raw('select 1+1 as result').then(function () {
        next();
    }).catch(() => {
        throw new Error('No db connection');
    });
});

app.listen(port, () => {
    statEmitter.on('newUser', () => stats.totalUsers++ );
    statEmitter.on('newBet', () => stats.totalBets++ );
    statEmitter.on('newEvent', () => stats.totalEvents++ );
    console.log(`App listening at http://localhost:${port}`);
});

// Do not change this line
module.exports = { app };