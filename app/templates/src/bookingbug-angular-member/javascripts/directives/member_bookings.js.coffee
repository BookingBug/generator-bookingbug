angular.module('BBMember').directive 'memberBookings', ($rootScope) ->

  link = (scope, element, attrs) ->
    $rootScope.bb ||= {}
    $rootScope.bb.api_url ||= scope.apiUrl
    $rootScope.bb.api_url ||= "http://www.bookingbug.com"

  {
    link: link
    templateUrl: 'member_bookings_tabs.html'
    scope:
      apiUrl: '@'
      member: '='
  }
