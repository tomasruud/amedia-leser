var gulp = require('gulp');
var webserver = require('gulp-webserver');
var plumber = require('gulp-plumber');
var include = require('gulp-include');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var clean = require('del');

var roots = {
  app: 'app/',
  assets: 'app/assets/',
  bower: 'bower_components/',
  dist: '../',
};

var watchers = {
  css: roots.assets + 'stylesheets/**/*',
  js: roots.assets + 'javascripts/**/*',
  images: roots.assets + 'images/**/*'
}

var files = {
  stylesheets: ['stylesheets/app.scss'],
  javascripts: ['javascripts/app.js'],
  images: ['images/**/*'],
  fonts: [],
  misc: [],
};

var dest = {
  images: roots.dist + 'images',
  fonts: roots.dist + 'fonts',
  stylesheets: roots.dist + 'stylesheets',
  javascripts: roots.dist + 'javascripts',
};

var sass_options = {
  includePaths: [roots.bower + 'foundation-sites/scss', roots.bower + 'material-color']
};

// If dist folder is moved outside the project folder, set force to true
gulp.task('clean:dist', function () {
  return clean.sync([
    dest.images,
    dest.fonts,
    dest.stylesheets,
    dest.javascripts
  ], {
    force: true
  });
});

gulp.task('sass', function () {
  return gulp.src(files.stylesheets, {
      cwd: roots.assets
    })
    .pipe(include())
    .on('error', console.log)
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass(sass_options))
    .pipe(gulp.dest(dest.stylesheets));
});

gulp.task('js', function () {
  return gulp.src(files.javascripts, {
      cwd: roots.assets
    })
    .pipe(include())
    .pipe(gulp.dest(dest.javascripts));
});

gulp.task('fonts', function () {
  return gulp.src(files.fonts, {
      cwd: roots.bower
    })
    .pipe(gulp.dest(dest.fonts));
});

gulp.task('images', function () {
  return gulp.src(files.images, {
      cwd: roots.assets
    })
    .pipe(gulp.dest(dest.images));
});

gulp.task('misc', function () {
  return gulp.src(files.misc, {
      cwd: roots.app
    })
    .pipe(gulp.dest(roots.dist));
});

gulp.task('minify', ['sass'], function () {
  return gulp.src(dest.stylesheets + '/**/*')
    .pipe(minify())
    .pipe(gulp.dest(dest.stylesheets))
});

gulp.task('uglify', ['js'], function () {
  return gulp.src(dest.javascripts + '/**/*')
    .pipe(uglify())
    .pipe(gulp.dest(dest.javascripts))
});

gulp.task('watch', function () {
  gulp.watch(watchers.css, ['sass']);
  gulp.watch(watchers.js, ['js']);
  gulp.watch(watchers.images, ['images']);
});

gulp.task('webserver', function () {
  gulp.src(roots.dist)
    .pipe(webserver({
      host: '0.0.0.0',
      port: '8080',
      livereload: true,
      directoryListing: false
    }));
});

var chains = {
  default: ['clean:dist', 'sass', 'misc', 'js', 'fonts', 'images', 'watch', 'webserver'],
  dist: ['clean:dist', 'minify', 'uglify', 'misc', 'fonts', 'images']
};

gulp.task('default', chains.default);
gulp.task('dist', chains.dist);
