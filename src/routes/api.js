module.exports = (app, express, models) => {
    var router = express.Router();

    router.get('/', (res, req) => {
        req.send('api');
    });

    router.route('/elections')

        .post((req, res) => {
            var election = new models.Election();
            election.title = req.body.title;
            election.description = req.body.description;
            election.save((err) => {
                if (err) {
                    res.send(err);
                }

                res.json({ message: "Election created" });
            });
        })

        .get((req, res) => {
            models.Election.find((err, elections) => {
                if (err) {
                    res.send(err);
                }
                res.json(elections);
            });
        });

    app.use('/api', router);


};
