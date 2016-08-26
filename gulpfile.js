const gulp = require('gulp');
const ava = require('gulp-ava');
const xo = require('gulp-xo');

const paths = {
  scripts: ['bin/**/*.js', 'lib/**/*.js'],
  tests: 'test/**/test*.js'
};

gulp.task('test', () =>
	gulp.src(paths.tests)
		.pipe(ava({
      nyc: true
    }))
);

gulp.task('lint', () =>
  gulp.src(paths.scripts)
    .pipe(xo())
);

gulp.task('watch', () => {
  gulp.watch(paths.scripts, ['lint']);
  gulp.watch(paths.tests, ['test']);
});
