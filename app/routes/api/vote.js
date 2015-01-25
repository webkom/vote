var express = require('express');
var vote = require('../../controllers/vote');

var router = express.Router();

router.route('/:alternative_id')
    .get(vote.list)
    .post(vote.create);

module.exports = router;
