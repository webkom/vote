module.exports = function (router,models) {

    router.route('/election/:election_id/alternatives')
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
                    var alternative = new models.Alternative({
                        'title':        req.body.title,
                        'description':  req.body.description
                    });
                    election.addAlternatives([alternative], function(err, election){
                        if (err) return res.send(err);
                        return res.status(201).send(election.alternatives);
                    });

                });

        });

};