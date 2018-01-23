const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

exports.writeScreenshot = (data, filename) => {
  const folder = path.resolve('screenshots');
  mkdirp(folder, err => {
    if (err) throw err;
    const writePath = path.resolve(folder, filename);
    const stream = fs.createWriteStream(writePath);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
  });
};
