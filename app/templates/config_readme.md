### configuration files facts:

- you can add any additional configuration in config.json file
- you can add any additional configuration json files within '/src/config' directory (file names don't matter)
- each configuration file has to define 'general' object
- environmental options local|development|staging|production are optional for all configuration files

### bbConfig constant facts:
 
- is generated on the fly with build process
- is made of /config.json and /src/config/**/*.json files (deep merge)
- all properties are upper cased 
- is meant to be used only with bespoke code (do not use it in SDK)