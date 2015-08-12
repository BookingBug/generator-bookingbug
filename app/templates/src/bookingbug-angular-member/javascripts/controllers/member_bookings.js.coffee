angular.module('BBMember').controller 'MemberBookings', ($scope, $modal, $log,
    MemberBookingService, $q, ModalForm, MemberPrePaidBookingService) ->

  $scope.loading = true

  $scope.getUpcomingBookings = () ->
    params =
      start_date: moment().format('YYYY-MM-DD')
    $scope.getBookings(params).then (bookings) ->
      $scope.upcoming_bookings = bookings

  $scope.getPastBookings = (num, type) ->
    date = moment().subtract(num, type)
    params =
      start_date: date.format('YYYY-MM-DD')
      end_date: moment().format('YYYY-MM-DD')
    $scope.getBookings(params).then (bookings) ->
      $scope.past_bookings = bookings

  $scope.flushBookings = () ->
    params =
      start_date: moment().format('YYYY-MM-DD')
    MemberBookingService.flush($scope.member, params)

  $scope.edit = (booking) ->
    booking.getAnswersPromise().then (answers) ->
      for answer in answers.answers
        booking["question#{answer.question_id}"] = answer.value
      ModalForm.edit
        model: booking
        title: 'Booking Details'
        templateUrl: 'edit_booking_modal_form.html'
        windowClass: 'member_edit_booking_form'

  $scope.cancel = (booking) ->
    modalInstance = $modal.open
      templateUrl: "member_booking_delete_modal.html"
      windowClass: "bbug"
      controller: ($scope, $rootScope, $modalInstance, booking) ->
        $scope.controller = "ModalDelete"
        $scope.booking = booking

        $scope.confirm_delete = () ->
          $modalInstance.close(booking)

        $scope.cancel = ->
          $modalInstance.dismiss "cancel"
      resolve:
        booking: ->
          booking
    modalInstance.result.then (booking) ->
      $scope.cancelBooking(booking)

  $scope.getBookings = (params) ->
    $scope.loading = true
    defer = $q.defer()
    MemberBookingService.query($scope.member, params).then (bookings) ->
      $scope.loading = false
      defer.resolve(bookings)
    , (err) ->
      $log.error err.data
      $scope.loading = false
    defer.promise

  $scope.cancelBooking = (booking) ->
    $scope.loading = true
    MemberBookingService.cancel($scope.member, booking).then () ->
      if $scope.bookings
        $scope.bookings = $scope.bookings.filter (b) -> b.id != booking.id
      if $scope.removeBooking
        $scope.removeBooking(booking)
      $scope.loading = false

  $scope.getPrePaidBookings = (params) ->
    $scope.loading = true
    defer = $q.defer()
    MemberPrePaidBookingService.query($scope.member, params).then (bookings) ->
      $scope.loading = false
      $scope.pre_paid_bookings = bookings
      defer.resolve(bookings)
    , (err) ->
      $log.error err.data
      $scope.loading = false
    defer.promise
