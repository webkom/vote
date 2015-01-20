
module.exports = function (router,models) {

    router.route('/alternative')
        .post(function (req, res) {
            new models.Alternative({
                'title':        req.body.title,
                'description':  req.body.description
            }).save(function(err){
                    if (err) return res.send(err);
                    return res.json({ message: "Election created" });
                });
        })

        .get(function(req, res){
            models.Alternative.find(function (err, alternatives) {
                if (err) return res.send(err);
                return res.json(alternatives);
            });
        });

    router.route('/election/:election_id')
        .get(function (req, res) {
            models.Election.findById(req.params.election_id, function (err, election) {
                if (err) return res.send(err);
                return res.json(election);
            });
        });

    router.route('/alternative/:alternative_id/vote')
        .post(function (req, res) {
            models.Alternative.findById(req.params.alternative_id, function (err, alternative) {
                alternative.addVote('test', function (err,vote){
                    if (err) return res.send(err);
                    return res.json(vote);
                });
            });
        });

};

