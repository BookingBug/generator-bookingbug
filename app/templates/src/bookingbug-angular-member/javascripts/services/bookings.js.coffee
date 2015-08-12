angular.module('BB.Services').factory "MemberBookingService", ($q,
    SpaceCollections, $rootScope, MemberService, BBModel) ->

  query: (member, params) ->
    deferred = $q.defer()
    if !member.$has('bookings')
      deferred.reject("member does not have bookings")
    else
      member.$get('bookings', params).then (bookings) =>
        if angular.isArray bookings
          bookings = for booking in bookings
            new BBModel.Member.Booking(booking)
          deferred.resolve(bookings)
        else
          bookings.$get('bookings', params).then (bookings) =>
            bookings = for booking in bookings
              new BBModel.Member.Booking(booking)
            deferred.resolve(bookings)
          , (err) ->
            deferred.reject(err)
      , (err) ->
        deferred.reject(err)
    deferred.promise

  cancel: (member, booking) ->
    deferred = $q.defer()
    booking.$del('self').then (b) =>
      booking.deleted = true
      b = new BBModel.Member.Booking(b)
      MemberService.refresh(member).then (member) =>
        member = member
      , (err) =>
      deferred.resolve(b)
    , (err) =>
      deferred.reject(err)
    deferred.promise

  update: (booking) ->
    deferred = $q.defer()
    $rootScope.member.flushBookings()
    booking.$put('self', {}, booking).then (booking) =>
      book = new BBModel.Member.Booking(booking)
      SpaceCollections.checkItems(book)
      deferred.resolve(book)
    , (err) =>
      _.each booking, (value, key, booking) ->
        if key != 'data' && key != 'self'
          booking[key] = booking.data[key]
      deferred.reject(err, new BBModel.Member.Booking(booking))
    deferred.promise

  flush: (member, params) ->
    if member.$has('bookings')
      member.$flush('bookings', params)
