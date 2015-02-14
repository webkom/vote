var mongoose = require('mongoose');
var User = require('../../app/models/user');

module.exports = function () {
  this.Before(function(callback) {
    var mongoURL = 'mongodb://localhost:27017/ads_cucumber';

    mongoose.connect(mongoURL, function(err) {
      if (err) throw err;

      var user = new User({ username: 'dumbledore', cardkey: 'CARDKEY' });
      User.register(user, 'acid pops', function (err) {
        if (err) throw err;
        mongoose.close(callback);
      });
    });
  });

  this.After(function(callback) {
    //mongoose.connection.collections.ads_cucumber.drop( function(err) {
    //  if (err) throw err;
    //  callback();
    //});
  });
};
