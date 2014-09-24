module.exports = (app, express) => {
    var router = express.Router();

    app.use('/api', router);

    router.get('/', (res, req) => {
        console.log('This is api');
    });
};
