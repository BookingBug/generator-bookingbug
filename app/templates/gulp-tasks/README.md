#### OPTIONS 

_**--env**_

 + default value is 'dev'
 + available options ['local', 'dev', 'staging', 'prod'] 
  
### RUN WEB SERVER
`gulp run-project:watch`
`gulp` (default task, runs "run-project:watch")
`gulp run-project` (one time run, used by CI)

### SAMPLE PROJECT - e2e tests
`gulp test-e2e --project=demo`

For builds Don't forget *--env=prod* otherwise build will not contain uglified/minified script files
   

