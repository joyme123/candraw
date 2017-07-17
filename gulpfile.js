var gulp = require('gulp');
var webserver = require('gulp-webserver');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('server', function () {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});

gulp.task('compress',function(){
    // 1. 找到文件
    gulp.src('core/*.js')
    // 2. 压缩文件
        .pipe(uglify())

        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    // 3. 另存压缩后的文件
        .pipe(gulp.dest('dist/'))
});