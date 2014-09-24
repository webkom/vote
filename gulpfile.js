var gulp        = require('gulp');
var server      = require('gulp-express');
var sourcemaps  = require('gulp-sourcemaps');
var traceur     = require('gulp-traceur');
var concat      = require('gulp-concat');

var srcDir = 'src/*.js';
var distDir = 'dist/';


gulp.task('server', function () {
    //start the server at the beginning of the task
    server.run({
        file: distDir + 'server.js'
    });
});

gulp.task('compile', function () {
    return gulp.src(srcDir)
        .pipe(sourcemaps.init())
        .pipe(traceur())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(distDir));
});

gulp.task('watch', function() {
    gulp.watch(srcDir, ['compile','server']);

});

gulp.task('default', ['compile','server','watch']);
