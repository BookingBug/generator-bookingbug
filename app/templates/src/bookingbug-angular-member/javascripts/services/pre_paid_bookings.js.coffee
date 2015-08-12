angular.module('BB.Services').factory "MemberPrePaidBookingService", ($q,
  BBModel) ->

      query: (member, params) ->
        deferred = $q.defer()
        if !member.$has('pre_paid_bookings')
          deferred.reject("member does not have pre paid bookings")
        else
          member.$get('pre_paid_bookings', params).then (bookings) =>
            if angular.isArray bookings
              # pre paid bookings were embedded in member
              bookings = for booking in bookings
                new BBModel.Member.PrePaidBooking(booking)
              deferred.resolve(bookings)
            else
              bookings.$get('pre_paid_bookings', params).then (bookings) =>
                bookings = for booking in bookings
                  new BBModel.Member.PrePaidBooking(booking)
                deferred.resolve(bookings)
          , (err) =>
            deferred.reject(err)
        deferred.promise
