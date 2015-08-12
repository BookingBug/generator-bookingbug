angular.module('BBMember.Services').factory "MemberLoginService", ($q, halClient,
    $rootScope, BBModel) ->
 
  login: (form, options) ->
    defer = $q.defer()
    url = "#{$rootScope.bb.api_url}/api/v1/login"
    url = "#{url}/member/#{options.company_id}" if options.company_id?
    halClient.$post(url, options, form).then (login) ->
      if login.$has('member')
        login.$get('member').then (member) ->
          member = new BBModel.Member.Member(member)
          defer.resolve(member)
      else if login.$has('members')
        defer.resolve(login)
      else
        defer.reject("No member account for login")
    , (err) =>
      if err.status == 400
        login = halClient.$parse(err.data)
        if login.$has('members')
          defer.resolve(login)
        else
          defer.reject(err)
      else
        defer.reject(err)
    defer.promise

