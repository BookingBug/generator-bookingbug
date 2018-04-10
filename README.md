# generator-bookingbug
A Yeoman generator to create a BookingBug project.

By editing the html files in templates and the scss files in stylesheets you
can customise the booking widget to suit your requirements.

### Create your project

To work with latest BookingBug SDK version 3.x.x : 
1. [Install latest node LTS version](https://nodejs.org/en/download/) node 8.x, npm 5.x
2. Install required npm tools and BookingBug generator version 1.*.* ```npm install -g gulp-cli yo generator-bookingbug```
3. To create new project trigger generator: ```yo bookingbug```


To work with BookingBug SDK version 2.x.x:
1. Please use: node 6.x, npm 3.x
2. Install required npm tools and BookingBug generator version 0.*.* ```npm install -g gulp-cli yo generator-bookingbug@0.5.2```
3. To create new project trigger generator: ```yo bookingbug```


Please trigger ```yo bookingbug --help``` to find out about available options. 


### Editing Style

Basic styling can be changed be editing a projects Bootstrap and BB sass variables. To override the styling of Bootstrap/SDK components or add additional styling, make edits to the theme scss file created by the generator.

### Editing Templates

Templates are loaded via a projects dependency to the SDK.  In order to edit them, take copies of the templates and add them to the `sdk-templates` directory.

#### Booking Projects

When building a booking widget, projects use "step templates" which are loaded within a single "main" template. 
Step templates represent the different steps in a booking journey whereas the "main" template acts a wrapper for the step 
templates defining components such as headers, breadcrumbs, alerts and footers.

> To determine the current step template when running a project, use [Batarang](https://chrome.google.com/webstore/detail/angularjs-batarang-stable/niopocochgahfkiccpjmmpchncjoapek) in the Chrome console to access the scoped variable that stores the currently loaded step, e.g. `$scope.bb.current_page`

## Further Documentation
1. [SDK Usage Guide](http://docs.bookingbug.com/docs/javascript-sdk)
