module.exports = (app, express, models) => {
    var router = express.Router();
    app.use('/api',router);

    router.get('/', (res, req) => {
        req.send('api');
    });

    router.get('/isAuthenticated', (req, res) => {
            return res.json({user: req.user});
        });

    require('./election')(router,models);


};