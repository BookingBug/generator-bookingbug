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
### Types of application currently supported

* public booking application
* member application

### Yo options
`yo bookingbug --help` or `yo bookingbug -h` for help

* `--skip-npm` skip installing npm dependencies
* `--skip-bower` skip installing bower dependencies


### Use Gulp tasks

* `gulp` to watch files for changes and serve at http://localhost:8000
