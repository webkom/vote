var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/fakedb');

var models = require('../../models')(mongoose);

require('../routes')(models);
require('../models')(models);