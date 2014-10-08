module.exports = (app, express, models) => {
    var router = express.Router();

    router.get('/', (res, req) => {
        req.send('api');
    });

    router.route('/elections')

        .post((req, res) => {
            var election = new models.Election();
            console.log(req.body);
            election.title = req.body.title;
            election.description = req.body.description;
            election.save((err) => {
                if (err) {
                    return res.send(err);
                }

                return res.json({ message: "Election created" });
            });
        })

        .get((req, res) => {
            models.Election.find((err, elections) => {
                if (err) {
                    return res.send(err);
                }
                return res.json(elections);
            });
        });

    router.route('/elections/:election_id')

        .get(function (req, res) {
            models.Election.findById(req.params.election_id, function (err, election) {
                if (err) {
                    res.send(err);
                }

                res.json(election);
            });
        });

    app.use('/api', router);


};
