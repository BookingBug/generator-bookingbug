# generator-bookingbug

A Yeoman generator to create a BookingBug project.

By editing the html files in templates and the scss files in stylesheets you
can customise the booking widget to suit your requirements.

## Usage

### Create your project

Install the required tools: `yo`, `gulp`, `bower`
```
npm install -g yo gulp bower
```

Install `generator-bookingbug`
```
npm install -g generator-bookingbug
```

Run `yo bookingbug`
```
yo bookingbug
```

### Yo options

`yo bookingbug --help` or `yo bookingbug -h` for help

* `--skipNpm` skip installing npm dependencies
* `--skipBower` skip installing bower dependencies

### Use Gulp tasks

* `gulp` to watch files for changes and serve at http://localhost:8000


### Editing Style

You can change the style of your project by editing the Bootstrap and BB sass variables.  If you need to override the styling of any Bootstrap/SDK components or add additional styling, you can make edits in the theme scss file created by the generator.

### Editing Templates
Templates can be edited by overriding templates by their name in your project templates directory.

#### Booking Projects

When building a booking widget, projects use "step templates" which are loaded within a single "main" template. Step templates represent the different steps in a booking jounrey whereas the "main" template acts a wrapper for the step templates defining components such as headers, breadcrumbs, alerts and footers.

You can determine the current step template when running a project by using [Batarang](https://chrome.google.com/webstore/detail/angularjs-batarang-stable/niopocochgahfkiccpjmmpchncjoapek) in the Chrome console to access the scoped variable that stores the currently loaded step:

* `$scope.bb.current_page`

## Further Documentation
1. [Usage Guide](http://docs.bookingbug.com/docs/javascript-sdk)
2. [SDK Reference](http://platform.bookingbug.com/sdkdocs)
3. [SDK Wiki](https://github.com/BookingBug/bookingbug-angular/wiki)

