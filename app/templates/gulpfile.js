var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var del = require('del');
var connect = require('gulp-connect');
var templateCache = require('gulp-angular-templatecache');
var rename = require('gulp-rename');
var flatten = require('gulp-flatten');
var promptly = require('promptly');
var replace = require('gulp-replace');
var template = require('gulp-template');
var sass = require('gulp-sass');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var cssSelectorLimit = require('gulp-css-selector-limit');
var modRewrite = require('connect-modrewrite');
var open = require('gulp-open');
<% if (bb_dev) { %>
var awspublish = require('gulp-awspublish');
var environments = require('gulp-environments');
var development = environments.development;
var production = environments.production;
var staging = environments.make("staging");
var local = environments.make("local");
var username = require('git-user-name');
var email = require('git-user-email');
var argv = require('yargs').argv;
var rename = require('gulp-rename');
var _ = require('lodash');
var glob = require('glob');
var rimraf = require('rimraf');
var bower = require('gulp-bower');
var bowerLink = require('gulp-bower-link');
var inquirer = require('inquirer');
var webhook_config = {
  url: process.env.BB_SDK_SLACK_URL,
  user: "ROBO",
  icon_emoji: ":cow:"
};
var slack = require('gulp-slack')(webhook_config);
<% } %>
var config;
<% if (bb_dev) { %>
function getEnv() {
  return environments.current().$name;
}

gulp.task('get-config', function() {
  if (!process.env.NODE_ENV && !argv.env) environments.current(staging);
  delete require.cache[path.join(process.cwd(), 'config.json')];
  var all_config = require('./config.json');
  config = _.extend(all_config.general, all_config[getEnv()]);
});
<% } else { %>
gulp.task('get-config', function() {
  config = require('./config.json');
});
<% } %>

gulp.task('www', ['get-config'], function() {
  return gulp.src(['src/www/*'])
      .pipe(template(config))
      .pipe(gulp.dest('release'));
});

gulp.task('dependency-javascripts', ['get-config'<% if (bb_dev) { %>, 'bower-link'<% } %>], function() {
  return gulp.src(mainBowerFiles({filter: new RegExp('.js$')}))
    .pipe(gulpif(config.uglify, uglify({mangle: false}).on('error', gutil.log)))
    .pipe(concat('booking-widget-dependencies.js'))
    .pipe(gulp.dest('release'));
});

gulp.task('javascripts', ['get-config'], function() {
  return gulp.src('src/javascripts/**/*')
    .pipe(gulpif(/.*coffee$/, coffee().on('error', function(e) {
      gutil.log(e);
      this.emit('end');
    })))
    .pipe(gulpif(config.uglify, uglify({mangle: false}).on('error', gutil.log)))
    .pipe(concat('booking-widget.js'))
    .pipe(gulp.dest('release'));
});

gulp.task('templates', function() {
  return gulp.src('src/templates/**/*.html')
    .pipe(templateCache('booking-widget-templates.js', {module: 'TemplateOverrides', standalone: true}))
    .pipe(gulp.dest('release'));
});

gulp.task('images', function() {
  return gulp.src('src/images/*')
    .pipe(flatten())
    .pipe(gulp.dest('release/images'));
});

function filterStylesheets(path) {
  return (
    path.match(new RegExp('.css$')) &&
    !path.match(new RegExp('(bower_components\/bookingbug-angular-).+(\.css)')) &&
    path.indexOf('boostrap.') == -1
  );
}

gulp.task('dependency-stylesheets', <% if (bb_dev) { %>['bower-link'], <% } %>function() {
  return gulp.src(mainBowerFiles({ includeDev: true, filter: filterStylesheets }))
    .pipe(concat('booking-widget-dependencies.css'))
    .pipe(gulp.dest('release'));
});

gulp.task('stylesheets', <% if (bb_dev) { %>['bower-link'], <% } %>function() {
  return gulp.src('src/stylesheets/main.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({
      includePaths: ['bower_components/bootstrap-sass/assets/stylesheets'],
      outputStyle: 'compressed',
      errLogToConsole: true
    }))
    .pipe(concat('booking-widget.css'))
    .pipe(cssSelectorLimit.reporter('fail'))
    .pipe(sourcemaps.write('maps', { includeContent: false }))
    .pipe(gulp.dest('release'));
});

gulp.task('fonts', function() {
  return gulp.src(mainBowerFiles('**/*.{eot,svg,ttf,woff,woff2,otf}').concat('src/fonts/*'))
    .pipe(flatten())
    .pipe(gulp.dest('release/fonts'));
});

gulp.task('dependencies', ['dependency-javascripts', 'dependency-stylesheets']);

gulp.task('watch', ['assets'], function() {
  gulp.watch(mainBowerFiles(), ['dependencies']);
  gulp.watch(['src/javascripts/*', '!./**/*~'], ['javascripts']);
  gulp.watch(['src/stylesheets/*', '!./**/*~'], ['stylesheets']);
  gulp.watch(['src/images/*', '!./**/*~'], ['images']);
  gulp.watch(['src/templates/*', '!./**/*~'], ['templates']);
  gulp.watch(['src/www/*', '!./**/*~'], ['www']);
  gulp.watch(['src/fonts/*', '!./**/*~'], ['fonts']);
  gulp.watch(['release/*'], ['reload']);
  gulp.watch(['config.json'], ['get-config','dependencies','assets']);
});

gulp.task('webserver', ['assets','get-config'], function() {
  return connect.server({
    root: 'release',
    port: config.server_port,
    livereload: true,
    middleware: function(connect, options) {
      var middleware = [];
      //1. the rules that shape our mod-rewrite behavior
      var rules = [
        '!\\.html|\\.js|\\.css|\\.svg|\\woff|\\ttf|\\eot|\\woff2|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
      ];
      middleware.push(modRewrite(rules));
      //2. original middleware behavior
      var base = options.root;
      if (!Array.isArray(base)) {
        base = [base];
      }
      base.forEach(function(path) {
        middleware.push(connect.static(path));
      });
      return middleware;
    }
  });
});

gulp.task('openbrowser', ['webserver'], function() {
  return gulp.src('')
    .pipe(open({ uri: 'http://localhost:' + config.server_port + config.default_html }));
});

gulp.task('reload', function() {
  return gulp.src('./release/*')
    .pipe(connect.reload());
});

gulp.task('assets', ['templates', 'dependencies', 'javascripts', 'stylesheets', 'images', 'www', 'fonts']);

gulp.task('default', ['assets', 'watch', 'openbrowser'], function(){
    setTimeout(function(){console.log("All tasks done!");}, 30);
});

<% if (bb_dev) { %>
function logInfo(msg) {
  gutil.log(gutil.colors.green(msg));
}

function getVersion() {
  delete require.cache[require.resolve('./bower.json')];
  var bower = require('./bower.json');
  return _.find(bower.dependencies, function(v, k) {
    return k.match(/bookingbug-angular-/);
  });
}

function getUserDetails() {
  var user = username();
  var mail = email();
  if (user && user !== undefined) {
    return mail += " | " + user;
  } else {
    return mail;
  }
}

gulp.task('deploy', ['assets','get-config'], function() {
  if (!process.env.AWS_ACCESS_KEY_ID)
    throw new Error('Missing environment variable AWS_ACCESS_KEY_ID');
  if (!process.env.AWS_SECRET_ACCESS_KEY)
    throw new Error('Missing environment variable AWS_SECRET_ACCESS_KEY');
  if (!process.env.BB_SDK_SLACK_URL)
    throw new Error('Missing environment variable BB_SDK_SLACK_URL');
  var publisher = awspublish.create({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    params: {
      Bucket: 'bespoke.bookingbug.com'
    },
    region: 'eu-west-1'
  });
  logInfo("Deploying to " + getEnv() + " using SDK version " + getVersion());
  headers = {
    'Cache-Control': 'max-age=' + config.cache_control_max_age
  };
  var release_files;
  if (argv.media) {
    release_files = ['./release/images/**', './release/fonts/**'];
  } else {
    release_files = './release/**';
  }
  return gulp.src(release_files)
    .pipe(rename(function(path) {
      path.dirname = config.deploy_path + path.dirname;
    }))
    .pipe(awspublish.gzip({ext: ''}))
    .pipe(publisher.publish(headers, {force: true}))
    .pipe(awspublish.reporter())
    .pipe(slack(getUserDetails() + " deployed `" + config.app_name + "` to " + getEnv() + " with SDK version " + getVersion()));

});

function isLink(f) {
  try {
    var stat = fs.lstatSync(f);
    return stat && stat.isSymbolicLink();
  } catch(e) {
    return false;
  }
}

function isNotLink(f) {
  return !isLink(f);
}

function doBowerLink(folders, i, cb) {
  if (!process.env.BB_SDK_SRC_DIR)
    throw new Error('Missing environment variable BB_SDK_SRC_DIR');
  if (folders.length === 0) {
    cb();
    return;
  }
  var f = folders[i];
  var module = f.match(/.*(bookingbug-angular-.*)/)[1];
  var name = f.match(/bookingbug-angular-(.*)/)[1];
  var dir = process.env.BB_SDK_SRC_DIR + '/build/' + name;
  bowerLink(dir, module, null, {force: true})
  .on('error', function(e) {
    console.log(e.message);
  })
  .on('finish', function() {
    i += 1;
    if (i < folders.length) {
      doBowerLink(folders, i, cb);
    } else {
      bower({interactive: true})
      .on('prompt', function(prompts, callback) {
        inquirer.prompt(prompts, callback);
      })
      .on('end', cb);
    }
  });
}

gulp.task('bower-link', ['get-config'], function(cb) {
  glob("./bower_components/bookingbug-angular-*", function(err, folders) {
    if (!config.bower_link && _.some(folders, isLink)) {
      rimraf('./bower_components', function() {
        bower()
        .on('prompt', function(prompts, callback) {
          inquirer.prompt(prompts, callback);
        })
        .on('end', cb);
      });
    } else if (config.bower_link) {
      doBowerLink(_.filter(folders, isNotLink), 0, cb);
    } else {
      cb();
    }
  });
});
<% } %>

