var express = require('express');
var app = express();

var server = app.listen(3000,() => {
    console.log(`Testing port: ${server.address().port}`);
});

require('./routes')(app, express);