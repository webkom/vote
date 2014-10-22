
module.exports = (router,models) => {

    router.route('/election')
        .post((req, res) => {
            new models.Election({
                'title':        req.body.title,
                'description':  req.body.description
            }).save((err) => {
                if (err) return res.send(err);
                return res.json({ message: "Election created" });
            });
        })

        .get((req, res) => {
            models.Election.find((err, elections) => {
                if (err) return res.send(err);
                return res.json(elections);
            });
        });

    router.route('/election/:election_id')
        .get((req, res)=> {
            models.Election.findById(req.params.election_id, function (err, election) {
                if (err) return res.send(err);
                return res.json(election);
            });
        });

};

