var gulp = require('gulp'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    del = require('del'),
    connect = require('gulp-connect'),
    templateCache = require('gulp-angular-templatecache'),
    rename = require('gulp-rename'),
    flatten = require('gulp-flatten'),
    promptly = require('promptly'),
    argv = require('yargs').argv,
    replace = require('gulp-replace'),
    template = require('gulp-template'),
    sass = require('gulp-sass'),
    mainBowerFiles = require('main-bower-files'),
    uglify = require('gulp-uglify'),
    bower = require('gulp-bower'),
    fs = require("fs"),
    path = require('path');

var devConfig = './config.dev.json',
    stagingConfig = './config.staging.json',
    prodConfig = './config.json',
    pjson = require('./package.json');

var fileContent = fs.readFileSync("bower_components/" +
        pjson.bbAppType + "/" +
        pjson.bbAppType + "-templates.js", "utf8"),
    templates = [],
    editedTemplates = [],
    tempalteIndex,
    templateName,
    templateBody;

var templatesRegex = /(templateCache\.put.*\)\;)/g,
    templateNameRegex = /(templateCache\.put.*\"\,)/g,
    templateBodyRegex = /(\"\,\".*\"\)\;)/g;

gulp.task('clean', function(cb) {
    del.sync(['release']);
    cb();
});

/*gulp.task('repo_clone', function(cb) {
  git.clone("https://github.com/BookingBug/bookingbug-angular.git", {cwd: "./src/"}, function(err){
    //console.log(err);
    cb(null);
  });
});*/


gulp.task('getTemplatesFromJs', function() {

    templates = fileContent.match(templatesRegex);

    for (tempalteIndex = 0; tempalteIndex < templates.length; tempalteIndex++) {

        editedTemplates[tempalteIndex] = {};

        // get template name and remove unnecessary characters
        templateName = templates[tempalteIndex].match(templateNameRegex)[0];
        editedTemplates[tempalteIndex].name = templateName.slice(19, -2);

        // get template body and remove unnecessary characters
        templateBody = templates[tempalteIndex].match(templateBodyRegex)[0];
        editedTemplates[tempalteIndex].body = templateBody.slice(3, -3).replace(/\\r|\\n|\\/g, '');
    }

});

gulp.task('createTemplatesHtml', function() {

    var newTemplateName,
        newTemplateBody,
        templatesDestination;

    // Creates the tempaltes and writes them in src/templates/ folder
    for (tempalteIndex = 0; tempalteIndex < editedTemplates.length; tempalteIndex++) {

        newTemplateName = editedTemplates[tempalteIndex].name;
        newTemplateBody = editedTemplates[tempalteIndex].body;

        templatesDestination = 'src/templates/' + newTemplateName;

        fs.writeFileSync(templatesDestination, newTemplateBody);
    }

    return gulp.src('src/templates/**/*.html')
        .pipe(gulp.dest('release'));

});

gulp.task('www', function() {
    return gulp.src(['src/www/*'])
        .pipe(gulpif(argv.env == 'development' || argv.env == 'dev',
            template(require(devConfig)),
            gulpif(argv.env == 'production' || argv.production,
                template(require(prodConfig)),
                template(require(stagingConfig)))))
        .pipe(gulp.dest('release'));
});

gulp.task('javascripts', ['bower', 'templates'], function() {
    src = mainBowerFiles({
        filter: new RegExp('.js$')
    });

    src.push('src/javascripts/**/*');
    return gulp.src(src)
        .pipe(gulpif(/.*coffee$/, coffee().on('error', function(e) {
            gutil.log(e);
            this.emit('end');
        })))
        .pipe(gulpif(argv.env != 'development' && argv.env != 'dev',
            uglify({
                mangle: false
            }))).on('error', gutil.log)
        .pipe(concat('booking-widget.js'))
        .pipe(gulp.dest('release'));
});

gulp.task('templates', ['bower', 'createTemplatesHtml'], function() {
    return gulp.src('src/templates/**/*.html')
        .pipe(templateCache('booking-widget-templates.js', {
            module: 'BB'
        }))
        .pipe(gulp.dest('release'));
});

gulp.task('images', function() {
    return gulp.src('src/images/*')
        .pipe(flatten())
        .pipe(gulp.dest('release/images'));
});

function filterStylesheets(path) {
    if (path.match(new RegExp('.css$')) &&
        !path.match(new RegExp('bookingbug-angular-member.css$'))) {
        return true;
    } else {
        return false;
    }
}

gulp.task('stylesheets', ['bower'], function() {
    src = mainBowerFiles({
        filter: filterStylesheets
    });
    src.push('src/bookingbug-angular-member/stylesheets/main.scss');
    return gulp.src(src)
        .pipe(gulpif(/.*scss$/, sass({
            errLogToConsole: true
        })))
        .pipe(gulpif(argv.env == 'development' || argv.env == 'dev',
            template(require(devConfig)),
            template(require(prodConfig))))
        .pipe(flatten())
        .pipe(concat('booking-widget.css'))
        .pipe(gulp.dest('release'));
});

gulp.task('fonts', function() {
    return gulp.src('src/fonts/*')
        .pipe(flatten())
        .pipe(gulp.dest('release/fonts'));
});

gulp.task('watch', ['assets'], function() {
    gulp.watch(['./src/javascripts/*', '!./**/*~'], ['javascripts']);
    gulp.watch(['./src/stylesheets/*', '!./**/*~'], ['stylesheets']);
    gulp.watch(['./src/images/*', '!./**/*~'], ['images']);
    gulp.watch(['./src/templates/*', '!./**/*~'], ['templates']);
    gulp.watch(['./src/www/*', '!./**/*~'], ['www']);
    gulp.watch(['./src/fonts/*', '!./**/*~'], ['fonts']);
});

gulp.task('webserver', ['assets'], function() {
    return connect.server({
        root: [
            'release',
            '../bookingbug-angular/release'
        ],
        port: 8000
    });
});

gulp.task('bower', function() {
    return bower();
});

gulp.task('assets', ['clean', 'getTemplatesFromJs', 'www', 'javascripts', 'stylesheets',
    'images', 'fonts'
]);

gulp.task('default', ['assets', 'watch', 'webserver'], function() {
    setTimeout(function() {
        console.log("All tasks done!");
    }, 30);
});
