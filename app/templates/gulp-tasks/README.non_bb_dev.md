
#### DEFAULT TASK

`gulp` or `gulp run:watch` 

   + runs web server in watch mode          
     
`gulp unit-tests:watch`     
   +  starts web server with `gulp run:watch` and additionally start karma server for unit tests in watch mode
   
##### Karma server for unit tests

* Loads bower dependencies and JavaScript|CoffeeScript files located in your src/javascripts directory.
* Loads "Jasmine" framework.
* Uses "PhantomJS" browser by default.
* Generates lcov report in two formats: .info & .html.
* Spec files should live next to the files they're testing.
* Spec files names should follow pattern *.spec.js.coffee                                                     
* Please follow [Jasmine documentation](https://jasmine.github.io/2.5/introduction) and  [AngualrJS unit testing documentation](https://docs.angularjs.org/guide/unit-testing) to learn more about writing AngularJS tests with Jasmine framework.