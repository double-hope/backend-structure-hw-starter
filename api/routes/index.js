import usersRoutes from './users.routes';
import getHealthRoutes from './health.routes';
import transactionRoutes from './transactions.routes';
import eventsRoutes from './events.routes';
import statsRoutes from './stats.routes';
import betsRoutes from './bets.routes';

export default (app) => {
    app.use('/health', getHealthRoutes);
    app.use('/users', usersRoutes);
    app.use('/transactions', transactionRoutes);
    app.use('/events', eventsRoutes);
    app.use('/stats', statsRoutes);
    app.use('/bets', betsRoutes);
}