import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

export const writeScreenshot = (data, filename) => {
  const folder = path.resolve('screenshots');
  mkdirp(folder, (err) => {
    if (err) throw err;
    const writePath = path.resolve(folder, filename);
    const stream = fs.createWriteStream(writePath);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
  });
};
