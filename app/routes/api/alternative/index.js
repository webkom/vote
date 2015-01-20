module.exports = function (router,models) {

    router.route('/election/:election_id/alternative')
        .get(function (req, res){
            models.Election.findById(req.params.election_id)
                .populate('alternatives')
                .exec(function (err, election) {
                    if (err) return res.send(err);
                    return res.json(election.alternatives);
                });
        })
        .post(function (req, res) {
            models.Election.findById(req.params.election_id)
                .populate('alternatives')
                .exec(function (err, election) {
                    if (err) return res.send(err);
                    new models.Alternative({
                        'title':        req.body.title,
                        'description':  req.body.description
                    }).save(function(err, alt){
                            if (err) return res.send(err);
                            return res.status(201).send(alt);
                        });

                });

        });

};