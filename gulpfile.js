var gulp        = require('gulp');
var server      = require('gulp-express');
var mocha       = require('gulp-mocha');

var distDir = 'app/';

gulp.task('server', function () {
    server.run({
        file: distDir + 'server.js'
    });
});


gulp.task('test', function () {
    gulp.src(distDir+'test/**/*.js')
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('default', ['server']);