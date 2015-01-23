module.exports = function (app, express, models){
    var router = express.Router();
    app.use('/api',router);

    router.get('/', function (res, req) {
        req.send('api');
    });

    require('./election')(router,models);
    require('./user')(router,models);
    require('./alternative')(router,models);
    require('./vote')(router,models);





};