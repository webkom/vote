var express     = require('express');
var mongoose    = require('mongoose');

var app = express();
mongoose.connect('mongodb://localhost:27017/test');

var models = require('./models')(mongoose);

var testUser = new models.User({
    username: "test",
    password: "test"
});
testUser.save((err,usr)=>{
    console.log(usr);

});



var server = app.listen(3000,() => {
    console.log(`Running on port: ${server.address().port}`);
});

require('./routes')(app, express);