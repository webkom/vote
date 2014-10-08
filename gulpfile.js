var gulp        = require('gulp');
var server      = require('gulp-express');
var sourcemaps  = require('gulp-sourcemaps');
var traceur     = require('gulp-traceur');
var clean       = require('gulp-clean');
var runSequence = require('run-sequence');
var mocha       = require('gulp-mocha');


var srcDir = ['src/config/**/*.js', 'src/models/**/*.js', 'src/public/js/**/*.js',
    'src/routes/**/*.js', 'src/test/**/*.js', 'src/*.js'];
var srcStatic = ['src/**/*.html', 'src/**/*.css', 'src/public/libs/**/*.js'];
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

gulp.task('moveFiles', function () {
    return gulp.src(srcStatic, {base: './src/'})
        .pipe(gulp.dest(distDir));
});

gulp.task('clean', function () {
    return gulp.src(distDir+'*')
        .pipe(clean())
});

gulp.task('watch', function() {
    gulp.watch(srcDir, runSequence('compile','moveFiles','server'));

});

gulp.task('test', function () {
    gulp.src(distDir+'test/**/*.js')
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('default', runSequence('compile','moveFiles', 'watch'));