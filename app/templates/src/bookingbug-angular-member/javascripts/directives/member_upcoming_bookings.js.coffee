angular.module('BBMember').directive 'bbMemberUpcomingBookings', ($rootScope) ->

  link = (scope, element, attrs) ->
    $rootScope.bb ||= {}
    $rootScope.bb.api_url ||= scope.apiUrl
    $rootScope.bb.api_url ||= "http://www.bookingbug.com"

    getBookings = () ->
      scope.getUpcomingBookings()

    scope.$on 'updateBookings', () ->
      scope.flushBookings()
      getBookings()

    getBookings()

  {
    link: link
    controller: 'MemberBookings'
    templateUrl: 'member_upcoming_bookings.html'
    scope:
      apiUrl: '@'
      member: '='
  }
