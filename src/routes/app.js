module.exports = (app, express) => {
    var router = express.Router();

    router.get('/', (res, req) => {
        req.send('app');
    });

    app.use('/*', router);


};
