#### OPTIONS 
_**--project**_ 

 + default value is './build/booking-widget' and it's being used to build booking-widget 
 + can be used to run web server or e2e tests for sample project, value should be sample project directory name within '.test/projects/' directory
 
_**--env**_

 + default value is 'dev'
 + available options ['dev', 'staging', 'prod'] 
  
 
### SAMPLE PROJECT - run web server
`gulp run-project:watch --project=demo`
`gulp --project=demo` (default task, runs "run-project:watch")
`gulp run-project --project=demo` (one time run, used by CI)

--project option is required


### SAMPLE PROJECT - e2e tests
`gulp test-e2e --project=demo`

--project option is required


### SDK - unit tests
`gulp test-unit:watch`
`gulp test-unit` (one time run, used by CI)


### DEPLOY SDK & BOOKING-WIDGET BUILD  
`gulp deploy --env=prod`

Don't forget *--env=prod* otherwise build will not contain uglified/minified script files
   

