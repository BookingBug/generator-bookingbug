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

Basic styling can be changed be editing a projects Bootstrap and BB sass variables. To override the styling of Bootstrap/SDK components or add additional styling, make edits to the theme scss file created by the generator.

### Editing Templates

Templates are loaded via a projects dependancy to the SDK.  In order to edit them, take copies of the templates and add them to the `templates` directory.

> To have easy access to the templates, clone the [SDK](https://github.com/BookingBug/bookingbug-angular).

> Templates are scoped in order to prevent naming conflicts. For example, to override `templates/event-chain-table/event_chain_table_main.html`, create a `event-chain-table` directory in the `templates` directory.

#### Booking Projects

When building a booking widget, projects use "step templates" which are loaded within a single "main" template. Step templates represent the different steps in a booking jounrey whereas the "main" template acts a wrapper for the step templates defining components such as headers, breadcrumbs, alerts and footers.

> To determine the current step template when running a project, use [Batarang](https://chrome.google.com/webstore/detail/angularjs-batarang-stable/niopocochgahfkiccpjmmpchncjoapek) in the Chrome console to access the scoped variable that stores the currently loaded step:

```
$scope.bb.current_page
```

## Further Documentation
1. [SDK Usage Guide](http://docs.bookingbug.com/docs/javascript-sdk)
2. [SDK Reference](http://platform.bookingbug.com/sdkdocs)
3. [SDK Wiki](https://github.com/BookingBug/bookingbug-angular/wiki)
