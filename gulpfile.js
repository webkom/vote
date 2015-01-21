var gulp        = require('gulp');
var server      = require('gulp-express');
var mocha       = require('gulp-mocha');
var istanbul    = require('gulp-istanbul');


var distDir = 'app/';

gulp.task('server', function () {
    server.run({
        file: distDir + 'server.js'
    });
});

gulp.task('test', function (cb) {
    gulp.src([distDir+'**/*.js',distDir+'server.js'])
        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src([distDir +'test/**/*.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports()) // Creating the reports after tests runned
                .on('end', cb);
        });
});

