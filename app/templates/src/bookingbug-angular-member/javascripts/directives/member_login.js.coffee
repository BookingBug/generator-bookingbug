angular.module('BBMember').directive 'loginMember', ($modal, $log, $rootScope,
    MemberLoginService, $templateCache, $q) ->

  loginMemberController = ($scope, $modalInstance, company_id) ->
    $scope.title = 'Login'
    $scope.schema =
      type: 'object'
      properties:
        email: { type: 'string', title: 'Email' }
        password: { type: 'string', title: 'Password' }
    $scope.form = [{
      key: 'email',
      type: 'email',
      feedback: false,
      autofocus: true
    },{
      key: 'password',
      type: 'password',
      feedback: false
    }]
    $scope.login_form = {}

    $scope.submit = (form) ->
      options =
        company_id: company_id
      MemberLoginService.login(form, options).then (member) ->
        member.email = form.email
        member.password = form.password
        $modalInstance.close(member)
      , (err) ->
        $modalInstance.dismiss(err)

    $scope.cancel = () ->
      $modalInstance.dismiss('cancel')


  pickCompanyController = ($scope, $modalInstance, companies) ->
    $scope.title = 'Pick Company'
    $scope.schema =
      type: 'object'
      properties:
        company_id: { type: 'integer', title: 'Company' }
    $scope.schema.properties.company_id.enum = (c.id for c in companies)
    $scope.form = [{
      key: 'company_id',
      type: 'select',
      titleMap: ({value: c.id, name: c.name} for c in companies),
      autofocus: true
    }]
    $scope.pick_company_form = {}

    $scope.submit = (form) ->
      $modalInstance.close(form.company_id)

    $scope.cancel = () ->
      $modalInstance.dismiss('cancel')


  link = (scope, element, attrs) ->
    $rootScope.bb ||= {}
    $rootScope.bb.api_url ||= scope.apiUrl
    $rootScope.bb.api_url ||= "http://www.bookingbug.com"

    loginModal = () ->
      modalInstance = $modal.open
        templateUrl: 'login_modal_form.html'
        controller: loginMemberController
        resolve:
          company_id: () -> scope.companyId
      modalInstance.result.then (result) ->
        scope.memberEmail = result.email
        scope.memberPassword = result.password
        if result.$has('members')
          result.$get('members').then (members) ->
            scope.members = members
            $q.all(m.$get('company') for m in members).then (companies) ->
              pickCompanyModal(companies)
        else
          scope.member = result
      , () ->
        loginModal()

    pickCompanyModal = (companies) ->
      modalInstance = $modal.open
        templateUrl: 'pick_company_modal_form.html'
        controller: pickCompanyController
        resolve:
          companies: () -> companies
      modalInstance.result.then (company_id) ->
        scope.companyId = company_id
        tryLogin()
      , () ->
        pickCompanyModal()

    tryLogin = () ->
      login_form =
        email: scope.memberEmail
        password: scope.memberPassword
      options =
        company_id: scope.companyId
      MemberLoginService.login(login_form, options).then (result) ->
        if result.$has('members')
          result.$get('members').then (members) ->
            scope.members = members
            $q.all(m.$get('company') for m in members).then (companies) ->
              pickCompanyModal(companies)
        else
          scope.member = result
      , (err) ->
        loginModal()


    if scope.memberEmail && scope.memberPassword
      tryLogin()
    else
      loginModal()

  {
    link: link
    scope:
      memberEmail: '@'
      memberPassword: '@'
      companyId: '@'
      apiUrl: '@'
      member: '='
    transclude: true
    template: """
<div ng-show='member' ng-transclude></div>
"""
  }

