#### OPTIONS 

_**--env**_

 + default value is 'dev'
 + available options ['local', 'dev', 'staging', 'prod'] 
  
#### DEFAULT TASK

`gulp` or `gulp run:watch` 

   + runs web server in watch mode (if local sdk is being used - it watches also sdk changes)   
   + please do not run 'bower install' before, bower dependencies are being managed by task itself
   + note it's worth to remove bower_components directory when switching between local and external sdk
     
     
`gulp unit-tests:watch`
   +  starts web server with `gulp run:watch` and additionally start karma server for unit tests

