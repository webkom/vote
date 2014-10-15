module.exports = (app, express, models) => {
    var router = express.Router();
    app.use('/api',router);

    router.get('/', (res, req) => {
        req.send('api');
    });

    require('./election')(router,models);


};