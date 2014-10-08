var mongoose = require('mongoose');
var mockgoose = require('mockgoose');

mockgoose(mongoose);

mongoose.connect('mongodb://localhost/fakedb');

var models = require('../../models')(mongoose);

require('../routes')(models);
require('../models')(models);