var gulp        = require('gulp');
var server      = require('gulp-express');
var sourcemaps  = require('gulp-sourcemaps');
var traceur     = require('gulp-traceur');
var concat      = require('gulp-concat');
var clean       = require('gulp-clean');

var srcDir = 'src/**/*.js';
var distDir = 'dist/';

gulp.task('server', function () {
    server.run({
        file: distDir + 'server.js'
    });
});

gulp.task('compile', function () {
    return gulp.src(srcDir, {base: './src/'})
        .pipe(sourcemaps.init())
        .pipe(traceur())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(distDir));
});

gulp.task('clean', function () {
    return gulp.src(distDir+'*')
        .pipe(clean())
});

gulp.task('watch', function() {
    gulp.watch(srcDir, ['clean', 'compile', 'server']);

});

gulp.task('default', ['clean', 'compile', 'server', 'watch']);
