var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    del = require('del'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    reactify = require('reactify')
;

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('clean', function() {
    del(['dist']);
});

gulp.task('vendor', function() {
    gulp.src('bower_components/bootstrap/dist/**/*')
        .pipe(gulp.dest('dist/vendor/bootstrap'));
    gulp.src('bower_components/jquery/dist/**/*')
        .pipe(gulp.dest('dist/vendor/jquery'));
});

gulp.task('html', function() {
    gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    gulp.src('app/styles/*')
        .pipe(gulp.dest('dist/css'));
});

gulp.task('browserify', function() {
    var b = browserify({
        entries: ['./app/scripts/main.js'],
        debug: true, fullPaths: true});
    b.transform(reactify);
    return b.bundle().on('error', handleError)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('distify', ['html', 'css', 'browserify', 'vendor']);

gulp.task('webserver', ['distify', 'watch'], function() {
    connect.server({livereload: false, root: 'dist', port: 8080});
});

gulp.task('watch', ['distify'], function() {
    gulp.watch('app/**/*.html', ['html']);
    gulp.watch('app/styles/**/*', ['css']);
    gulp.watch('app/scripts/**/*', ['browserify']);
    gulp.watch('app/images/**/*', ['images']);
});

gulp.task('default', ['distify', 'webserver', 'watch']);
