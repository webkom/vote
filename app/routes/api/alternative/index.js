module.exports = function (router,models) {

    router.route('/election/:election_id/alternatives')
        .get(function (req, res){
            models.Election.findById(req.params.election_id)
                .populate('alternatives')
                .exec(function (err, election) {
                    if (err) return res.send(err);
                    return res.send(election.alternatives);
                });
        })
        .post(function (req, res) {
            models.Election.findById(req.params.election_id)
                .populate('alternatives')
                .exec(function (err, election) {
                    if (err) return res.send(err);
                    var alternatives = [];
                    if (req.body.constructor != Array) req.body = [req.body];
                    req.body.forEach(function(alt){
                        alternatives.push(new models.Alternative({
                            'title':        alt.title,
                            'description':  alt.description,
                            'election': req.params.election_id
                        }));
                    });
                    election.addAlternatives(alternatives, function(err, election){
                        if (err) return res.send(err);
                        return res.status(201).send(election.alternatives);
                    });

                });

        });

};