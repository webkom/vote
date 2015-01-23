module.exports = function (router,models) {

    router.route('/vote/:alternative_id')
        .get(function (req, res){
            models.Alternative.findById(req.params.alternative_id)
                .populate('votes')
                .exec(function (err, alternative) {
                    if (err) return res.send(err);
                    return res.send(alternative.votes);
                });
        })
        .post(function (req, res) {
            models.Alternative.findById(req.params.alternative_id)
                .populate('votes')
                .exec(function (err, alternative) {
                    if (err) return res.send(err);
                    alternative.addVote(req.body.username, function(err, alternative){
                        if (err) return res.send(err);
                        return res.status(201).send(alternative.votes);
                    });
                });

        });

};