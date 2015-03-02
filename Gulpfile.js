var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    del = require('del'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    reactify = require('reactify')
;


// Removes the dist directory
gulp.task('clean', function(cb) {
    del(['dist'], cb);
});

// Copies the needed vendor files to various locations
gulp.task('vendor', function() {
    // We move the bootstrap directory to its own location inside vendor
    gulp.src('bower_components/bootstrap/dist/**/*')
        .pipe(gulp.dest('dist/vendor/bootstrap'));
    // Same for jquery
    gulp.src('bower_components/jquery/dist/**/*')
        .pipe(gulp.dest('dist/vendor/jquery'));
});


// Copies the html to dist
gulp.task('html', function() {
    gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});

// Copies the CSS to dist/css
gulp.task('css', function() {
    gulp.src('app/styles/*')
        .pipe(gulp.dest('dist/css'));
});

// Browserifies the bundled javascript and sends it to dist/js
gulp.task('javascript', function() {
    var b = browserify({debug: true});
    b.transform(reactify);
    // Make React available externally for dev tools
    b.require('react');
    return b.bundle()
        .pipe(source('app/scripts/main.js'))
        .pipe(gulp.dest('dist/js'));
});

// A task which combines all the tasks which copy everything to the dist
// directory
gulp.task('distify', ['html', 'css', 'javascript', 'vendor']);

// Starts a livereload webserver
gulp.task('webserver', ['distify', 'watch'], function() {
    connect.server({
        livereload: true,
        root: 'dist',
        port: 8080
    });
});

gulp.task('livereload', ['webserver'], function() {
    gulp.src('dist/**/*')
        .pipe(watch('*'))
        .pipe(connect.reload());
});

gulp.task('watch', ['distify'], function() {
    gulp.watch('app/**/*.html', ['html']);
    gulp.watch('app/styles/**/*', ['css']);
    gulp.watch('app/scripts/**/*', ['javascript']);
    gulp.watch('app/images/**/*', ['images']);
});

gulp.task('default', ['distify', 'webserver', 'livereload', 'watch']);
