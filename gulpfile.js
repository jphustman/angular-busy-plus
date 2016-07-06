'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var wiredep = require('wiredep'),
    browserSync = require('browser-sync'),

    reload = browserSync.reload,
    config = require('./gulp.config')();

function browserSyncInit(baseDir, files) {
    browserSync.instance = browserSync.init(files, {
        startPath: '/',
        server: { baseDir: baseDir }
    });
}

// Development server
gulp.task('serve', function () {

    $.runSequence('clean',
        ['scripts', 'styles'],
        'inject',
        function () {

            browserSync({
                notify: false,
                logPrefix: 'angular-busy-plus',
                scrollElementMapping: ['main', '.mdl-layout'],
                server: [config.build, config.src]
            });

            gulp.watch(config.src + '/**/*.html', ['inject', reload]);
            gulp.watch(config.src + '/styles/**/*.scss', ['styles']);
            gulp.watch(config.src + '/scripts/**/*.js', ['jshint', 'scripts']);
            gulp.watch(config.src + '/images/**/*', reload);

        });
});

// Production (builds dist folder)
gulp.task('serve:dist', ['clean', 'build'], function () {
    browserSyncInit(config.dist);
});


gulp.task('install', function () {
    return gulp.src(['./bower.json', './package.json'])
        .pipe($.install());
});

gulp.task('vendor-scripts', ['install'], function () {
    return gulp.src(wiredep().js)
        .pipe(gulp.dest(config.build + '/vendor'));
});

gulp.task('clean', function () {
    return del([config.build, config.dist, 'bower_components'], {dot: true});
});

gulp.task('inject', ['vendor-scripts'], function () {

    return gulp.src(config.src + '/index.html')
        .pipe(wiredep.stream({
            fileTypes: {
                html: {
                    replace: {
                        js: function (filePath) {
                            return '<script src="' + 'vendor/' + filePath.split('/').pop() + '"></script>';
                        }
                    }
                }
            }
        }))

        .pipe($.inject(
            gulp.src(config.scriptsOrder, { read: false }),
            {
                addRootSlash: false,
                transform: function (filePath) {
                    return '<script src="' + filePath.replace('build/', '') + '"></script>';
                }
            }
        ))

        .pipe($.inject(
            gulp.src([config.build + '/styles/**/*.css'], {read: false }),
            {
                addRootSlash: false,
                transform: function (filePath) {
                    return '<link rel="stylesheet" href="' + filePath.replace('build/', '') + '"/>';
                }
            }
        ))

        .pipe(gulp.dest(config.build));
});

gulp.task('styles', function () {

    var AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ];

    return gulp.src(config.src + '/styles/**/*.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({ precision: 10 })
            .on('error', $.sass.logError))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest(config.build + '/styles'))

        // concatenate and minify for dist
        .pipe($.if('*.css', $.cssnano()))
        .pipe($.size({title: 'styles'}))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest(config.dist + '/styles'));

});


gulp.task('scripts', ['jshint'],  function () {
    return gulp.src(config.src + '/scripts/**/*.js')
        .pipe(gulp.dest(config.build + '/scripts'));
});

gulp.task('jshint', function () {
    return gulp.src(config.src + '/scripts/**/*.js')
        .pipe(reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

