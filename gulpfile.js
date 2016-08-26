const gulp = require('gulp');
const ava = require('gulp-ava');
const xo = require('gulp-xo');

const paths = {
  scripts: ['bin/**/*.js', 'lib/**/*.js'],
  tests: 'test/**/test*.js'
};

gulp.task('test', () =>
	gulp.src(paths.tests)
		// gulp-ava needs filepaths so you can't have any plugins before it
		.pipe(ava())
);

gulp.task('lint', () =>
  gulp.src(paths.scripts)
    .pipe(xo())
);
