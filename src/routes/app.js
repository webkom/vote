module.exports = (app, express) => {
    var router = express.Router();

    router.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });

    router.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });

    app.use('/', router)

};
