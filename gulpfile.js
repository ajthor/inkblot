var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var git = require('gulp-git');
var docco = require('gulp-docco');

var cache = require('gulp-cached');
var remember = require('gulp-remember');

var jshint = require('gulp-jshint');
var inkblot = require('gulp-inkblot');
var mocha = require('gulp-mocha');

// Testing Task
// ============

gulp.task('lint', function () {
	return gulp.src(['./bin/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('inkblot', function () {
	return gulp.src(['./bin/**/*.js'])
		.pipe(inkblot())
		.on('error', gutil.log);
});

gulp.task('test', function () {
	return gulp.src(['./test/**/*.spec.js'])
		.pipe(mocha())
		.on('error', gutil.log);
});

gulp.task('watch', function () {
	gulp.watch(['./bin/**/*.js'], ['lint', 'inkblot', 'test']);
	gulp.watch(['./test/**/*.spec.js'], ['test']);
});

gulp.task('default', ['lint', 'inkblot', 'test', 'watch']);

// Docs Task
// =========
// The `docs` task builds docco files, switches to the gh-pages 
// branch, commits the docs, and switches back to the 
// development branch.
// 
// Usage: `gulp docs`
// 

gulp.task('checkout-master', shell.task(['git checkout master']));

gulp.task('docs-make', ['checkout-master'], function() {
	return gulp.src('./lib/**/*.js')
		.pipe(docco())
		.pipe(cache('docs'))
		.pipe(gulp.dest('./docs/'))
		.on('error', gutil.log);
});

gulp.task('docs-commit', ['docs-make'], shell.task([
	'git checkout gh-pages',
	'git add ./docs',
	'git commit -a -m \"update docs\"',
	'git checkout development'
]));

gulp.task('docs', ['docs-commit'], function() {
	git.push('origin', 'gh-pages');
});


