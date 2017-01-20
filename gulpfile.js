var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

// Set the banner content
var banner = ['/*!\n',
    ' * Diplom project',
    ' * Created:' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', function() {
    return gulp.src('less/freelancer.less')
        .pipe(less())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
    return gulp.src('css/freelancer.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('js/freelancer.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
        gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
            .pipe(gulp.dest('vendor/bootstrap'))

        gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
            .pipe(gulp.dest('vendor/jquery'))

        gulp.src([
                'node_modules/font-awesome/**',
                '!node_modules/font-awesome/**/*.map',
                '!node_modules/font-awesome/.npmignore',
                '!node_modules/font-awesome/*.txt',
                '!node_modules/font-awesome/*.md',
                '!node_modules/font-awesome/*.json'
            ])
            .pipe(gulp.dest('vendor/font-awesome'))
    })
    //lint js files
gulp.task('lint', function() {
    gulp.src('./**/*.js')
        .pipe(jshint())
})

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
})

//watch server.js with node.js and express.js

gulp.task('server', function() {
    var stream = nodemon({
        script: 'server.js',
        ext: 'html js',
        ignore: ['ignored.js'],
        tasks: ['lint']
    })

    stream
        .on('restart', function() {
            console.log('restarted!')
        })
        .on('crash', function() {
            console.error('Application has crashed!\n')
            stream.emit('restart', 10) // restart the server in 10 seconds 
        })
})

// Run everything
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy', 'browserSync', 'lint']);

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js'], function() {
    gulp.watch('less/*.less', ['less']);
    gulp.watch('css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
});