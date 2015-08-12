angular.module('BB.Models').factory "Member.PrePaidBookingModel", ($q, BBModel,
    BaseModel) ->

  class Member_PrePaidBooking extends BaseModel
    constructor: (data) ->
      super(data)

    checkValidity: (event) ->
      if @service_id && event.service_id && @service_id != event.service_id
        false
      else if @resource_id && event.resource_id && @resource_id != event.resource_id
        false
      else if @person_id && event.person_id && @person_id != event.person_id
        false
      else
        true
