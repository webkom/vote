module.exports = (app, express) => {
    var router = express.Router();

    router.get('/', (res, req) => {
        req.send('api');
    });

    app.use('/api', router);


};
