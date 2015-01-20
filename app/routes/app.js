var path = require('path');
module.exports = function (app, express) {
    var router = express.Router();

    router.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });

    router.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });

    app.use('/', router)

};
