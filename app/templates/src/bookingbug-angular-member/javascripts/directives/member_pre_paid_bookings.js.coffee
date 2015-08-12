angular.module('BBMember').directive 'bbMemberPrePaidBookings', ($rootScope) ->

  link = (scope, element, attrs) ->
    $rootScope.bb ||= {}
    $rootScope.bb.api_url ||= scope.apiUrl
    $rootScope.bb.api_url ||= "http://www.bookingbug.com"

    scope.loading = true

    getBookings = () ->
      scope.getPrePaidBookings({}).finally () ->
        scope.loading = false

    getBookings()

  {
    link: link
    controller: 'MemberBookings'
    templateUrl: 'member_pre_paid_bookings.html'
    scope:
      apiUrl: '@'
      member: '='
  }
