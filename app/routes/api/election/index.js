
module.exports = function (router,models) {

    router.route('/election')
        .post(function (req, res){
            new models.Election({
                'title':        req.body.title,
                'description':  req.body.description
            }).save(function (err) {
                if (err) return res.send(err);
                return res.json({ message: "Election created" });
            });
        })

        .get(function (req, res){
            models.Election.find()
                .populate('alternatives')
                .exec(function(err, elections){
                    if (err) return res.send(err);
                    return res.json(elections);
            });
        });

    router.route('/election/:election_id')
        .get(function (req, res){
            models.Election.findById(req.params.election_id)
                .populate('alternatives')
                .exec(function (err, election) {
                    if (err) return res.send(err);
                    return res.json(election);
                });
        });


};

