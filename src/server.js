var express = require('express');
var app = express();

var server = app.listen(3000,() => {
    console.log(`My poop is so big ${server.address().port}`);
});
