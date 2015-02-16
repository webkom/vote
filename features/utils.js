var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

exports.writeScreenshot = function(data, filename) {
    var folder = path.resolve('screenshots');
    mkdirp(folder, function(err) {
        if (err) throw err;
        var writePath = path.resolve(folder, filename);
        var stream = fs.createWriteStream(writePath);
        stream.write(new Buffer(data, 'base64'));
        stream.end();
    });
};
