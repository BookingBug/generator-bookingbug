angular.module('<%= name %>')
.constant('projectVersion', {project: <%= project %>, sdk: <%= sdk %>})
.run (projectVersion, $rootScope) -> $rootScope.projectVersion = projectVersion
