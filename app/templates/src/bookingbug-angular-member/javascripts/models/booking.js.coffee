'use strict';

angular.module('BB.Models').factory "Member.BookingModel", ($q, $window, BBModel, BaseModel, $bbug) ->

  class Member_Booking extends BaseModel
    constructor: (data) ->
      super(data)

      @datetime = moment.parseZone(@datetime)
      @datetime.tz(@time_zone) if @time_zone

      @end_datetime = moment.parseZone(@end_datetime)
      @end_datetime.tz(@time_zone) if @time_zone


    getGroup: () ->
      return @group if @group
      if @_data.$has('event_groups')
        @_data.$get('event_groups').then (group) =>
          @group = group
          @group


    getColour: () ->
      if @getGroup()
        return @getGroup().colour
      else
        return "#FFFFFF"


    getCompany: () ->
      return @company if @company
      if @$has('company')
        @_data.$get('company').then (company) =>
          @company = new BBModel.Company(company)
          @company


    getAnswers: () ->
      defer = $q.defer()
      defer.resolve(@answers) if @answers
      if @_data.$has('answers')
        @_data.$get('answers').then (answers) =>
          @answers = (new BBModel.Answer(a) for a in answers)
          defer.resolve(@answers)
      else
        defer.resolve([])
      defer.promise


    printed_price: () ->
      return "£" + @price if parseFloat(@price) % 1 == 0
      return $window.sprintf("£%.2f", parseFloat(@price))


    getMemberPromise: () =>
      defer = $q.defer()
      defer.resolve(@member) if @member
      if @_data.$has('member')
        @_data.$get('member').then (member) =>
          @member = new BBModel.Member.Member(member)
          defer.resolve(@member)
      defer.promise

    canCancel: () ->
      return moment(@min_cancellation_time).isAfter(moment())

    canMove: () ->
      return @canCancel()
