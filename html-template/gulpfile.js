'use strict';

var gulp         = require('gulp');
var sass         = require('gulp-sass');
var gutil        = require('gulp-util');
var jshint       = require('gulp-jshint');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var stylish      = require('jshint-stylish');
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');
var fileinclude  = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
var runSequence  = require('run-sequence');
var zip          = require('gulp-zip');
var bs           = require('browser-sync').create();
var rimraf       = require('rimraf'); 
var gm 			     = require('gulp-gm');

var path = {
    src: { 
        // source
        html    : 'app/*.html',
        others  : 'app/*.+(php|ico|png)',
        htminc  : 'app/partials/**/*.htm',
        incdir  : 'app/partials/',
        plugins : 'app/plugins/**/*.*',
        js      : 'app/js/*.js',
        scss    : 'app/scss/**/*.scss',
        images  : 'app/images/**/*.+(png|jpg|gif|svg)',
        doc     : 'documentation/**/*.*',
        blur 	  : 'app/images/**/*.jpg'
    },
    build: { 
        // build
        dir           : 'builds/free/',
        dirPremium    : 'builds/premium/template/',
        dirPremiumRoot: 'builds/premium/',
        dirDev        : 'builds/development/'
    }
};

var template = {
  version: {
    free: 'free',
    premium: 'premium'
  }
};

/* =====================================================
Development Builds
===================================================== */

// HTML
gulp.task('html:build', function () {
  return gulp.src(path.src.html)
    .pipe(customPlumber('Error Running html-include'))
    .pipe(fileinclude({
      basepath: path.src.incdir, context: {
        version: template.version.premium
      }
    }))
    .pipe(gulp.dest(path.build.dirDev))
    .pipe(bs.reload({
      stream: true
    }));
});

// SCSS
gulp.task('scss:build', function () {
  var ignoreNotification = false;
  return gulp.src(path.src.scss)
    .pipe(customPlumber('Error Running Sass'))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('/maps'))
    .pipe(gulp.dest(path.build.dirDev + 'css/'))
    .pipe(bs.reload({
      stream: true
    }));
});

// Javascript
gulp.task('js:build', function () {
  return gulp.src(path.src.js)
    .pipe(customPlumber('Error Running JS'))
    .pipe(jshint('./.jshintrc'))
    .pipe(notify(function (file) {
      if (!file.jshint.success) {
        return file.relative + " (" + file.jshint.results.length + " errors)\n";
      }
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', gutil.log)
    .pipe(gulp.dest(path.build.dirDev + 'js/'))
    .pipe(bs.reload({
      stream: true
    }));
});

// Images
gulp.task('images:build', function () {
  return gulp.src(path.src.images)
    .pipe(gulp.dest(path.build.dirDev + 'images/'))
    .pipe(bs.reload({
      stream: true
    }));
});

// Plugins
gulp.task('plugins:build', function () {
  return gulp.src(path.src.plugins)
    .pipe(gulp.dest(path.build.dirDev + 'plugins/'))
    .pipe(bs.reload({
      stream: true
    }));
});

// Other files like favicon, php, apple-icon on root directory
gulp.task('others:build', function () {
  return gulp.src(path.src.others)
    .pipe(gulp.dest(path.build.dirDev))
});

// Error Message Show
function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      // Customizing error title
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
      sound: "Glass"
    })
  });
}

// Clean Build Folder
gulp.task('clean', function (cb) {
  rimraf('./builds', cb);
});

// Watch Task
gulp.task('watch:build', function () {
  gulp.watch(path.src.html, ['html:build']);
  gulp.watch(path.src.htminc, ['html:build']);
  gulp.watch(path.src.scss, ['scss:build']);
  gulp.watch(path.src.js, ['js:build']);
  gulp.watch(path.src.images, ['images:build']);
  gulp.watch(path.src.plugins, ['plugins:build']);
});

// Build Task
gulp.task('build', function () {
  runSequence(
    // 'clean',
    'html:build',
    'js:build',
    'scss:build',
    'images:build',
    'plugins:build',
    'others:build',
    'watch:build',
    function () {
      bs.init({
        server: {
          baseDir: path.build.dirDev,
        }
      });
    }
  );
});

gulp.task("default", ["build"]);

/* =====================================================
Free Builds
===================================================== */
// HTML
gulp.task('html:free:build', function() {
  return gulp.src( path.src.html )
    .pipe(customPlumber('Error Running html-include'))
    .pipe(fileinclude({ basepath: path.src.incdir, context: {
      version: template.version.free
    } }))
    .pipe(gulp.dest( path.build.dir ));
});

// SCSS
gulp.task('scss:free:build', function () {
  var ignoreNotification = false;
  return gulp.src(path.src.scss)
    .pipe(customPlumber('Error Running Sass'))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('/maps'))
    .pipe(gulp.dest(path.build.dir + 'css/'));
});

// Javascript
gulp.task('js:free:build', function () {
  return gulp.src(path.src.js)
    .pipe(customPlumber('Error Running JS'))
    .pipe(jshint('./.jshintrc'))
    .pipe(notify(function (file) {
      if (!file.jshint.success) {
        return file.relative + " (" + file.jshint.results.length + " errors)\n";
      }
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', gutil.log)
    .pipe(gulp.dest(path.build.dir + 'js/'));
});

// Images
gulp.task('images-blur:free:build', function () {
  return gulp.src(path.src.blur)
    .pipe(gm(function (gmfile) {
      return gmfile.blur(30, 30);
    }))
    .pipe(gulp.dest(path.build.dir + 'images/'))
    .pipe(bs.reload({
      stream: true
    }));
});

gulp.task('images:free:build', function () {
  return gulp.src(path.src.images)
    .pipe(gulp.dest(path.build.dir + 'images/'));
});

// Plugins
gulp.task('plugins:free:build', function () {
  return gulp.src(path.src.plugins)
    .pipe(gulp.dest(path.build.dir + 'plugins/'))
});

// Other files like favicon, php, apple-icon on root directory
gulp.task('others:free:build', function () {
  return gulp.src(path.src.others)
    .pipe(gulp.dest(path.build.dir))
});

// Zipping
gulp.task('free-zip', function () {
  return gulp.src(path.build.dir + '/**/*.*')
    .pipe(zip('free.zip'))
    .pipe(gulp.dest('./builds'))
});

// Build Task
gulp.task('free', function () {
  runSequence(
    'html:free:build',
    'js:free:build',
    'scss:free:build',
    'images:free:build',
    'images-blur:free:build',
    'plugins:free:build',
    'free-zip'
  );
});



/* =====================================================
Premium Builds
===================================================== */

// HTML
gulp.task('html:premium:build', function() {
  return gulp.src( path.src.html )
    .pipe(customPlumber('Error Running html-include'))
    .pipe(fileinclude({ basepath: path.src.incdir, context: {
      version: template.version.premium
    } }))
    .pipe(gulp.dest( path.build.dirPremium ));
});

// SCSS
gulp.task('scss:premium:build', function() {
  var ignoreNotification = false;
  return gulp.src( path.src.scss )
    .pipe(customPlumber('Error Running Sass'))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('/maps'))
    .pipe(gulp.dest( path.build.dirPremium + 'css/' ));
});

gulp.task('scss-files:build', function () {
  return gulp.src(path.src.scss)
    .pipe(gulp.dest(path.build.dirPremium + 'scss/'))
    .pipe(bs.reload({
      stream: true
    }));
});

// Javascript
gulp.task('js:premium:build', function() {
  return gulp.src( path.src.js )
    .pipe(customPlumber('Error Running JS'))
    .pipe(jshint('./.jshintrc'))
    .pipe(notify(function (file) {
      if (!file.jshint.success) {
        return file.relative + " (" + file.jshint.results.length + " errors)\n";
      }
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', gutil.log)
    .pipe(gulp.dest( path.build.dirPremium + 'js/' ));
});

// Images
gulp.task('images-blur:premium:build', function() {
  return gulp.src( path.src.blur )
  	.pipe(gm(function (gmfile) {
	    return gmfile.blur(10, 10);
	 }))
    .pipe(gulp.dest( path.build.dirPremium + 'images/' ))
    .pipe(bs.reload({
      stream: true
    }));
});

gulp.task('images:premium:build', function() {
  return gulp.src( path.src.images )
    .pipe(gulp.dest( path.build.dirPremium + 'images/' ));
});

// Plugins
gulp.task('plugins:premium:build', function() {
  return gulp.src( path.src.plugins )
    .pipe(gulp.dest( path.build.dirPremium + 'plugins/' ))
});

// Other files like favicon, php, apple-icon on root directory
gulp.task('others:premium:build', function () {
  return gulp.src(path.src.others)
    .pipe(gulp.dest(path.build.dirPremium))
});

// Document Build
gulp.task('docs:build', function () {
  return gulp.src(path.src.doc)
    .pipe(gulp.dest(path.build.dirPremiumRoot + 'documentation/'))
});

// Zipping
gulp.task('premium-zip', function () {
  return gulp.src(path.build.dirPremiumRoot + '/**/*.*')
    .pipe(zip('premium.zip'))
    .pipe(gulp.dest('./builds'))
});

// Build Task
gulp.task('premium', function(){
  runSequence(
    'html:premium:build',
    'js:premium:build',
    'scss:premium:build',
    'scss-files:build',
    'images:premium:build',
    'images-blur:premium:build',
    'plugins:premium:build',
    'others:premium:build',
    'docs:build',
    'premium-zip'
  );
});
