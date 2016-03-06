var gulp = require('gulp');
// Requires the gulp-sass plugin
var sass = require('gulp-sass');
//minifies
var uglify = require('gulp-uglify');
//selects files based on certain requirements
var gulpIf = require('gulp-if');
//concats css to one
var cssnano = require('gulp-cssnano');


// Optimizing CSS and JavaScript --minify and copy to dest
gulp.task('minify', function() {
  return gulp.src('app/**/*')
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

//copy fonts
gulp.task('fonts', function() {
  return gulp.src('app/css/fonts/**/*.+(ttf)')
    .pipe(gulp.dest('dist/fonts'))
});

//sass to css
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
});

//build task to prepare dist folder
gulp.task('build', [ 'sass', 'minify', 'fonts'], function (){
});

//the watch task should do it all
gulp.task('watch', function(){
  gulp.watch('app/scss/**/*.scss', ['sass', 'minify', 'fonts']); 
})
