module.exports = [
  '$routeProvider',
  '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider

      .when('/', {
        templateUrl: 'partials/election',
        controller: 'electionController'
      })

      .when('/retrieve', {
        templateUrl: 'partials/retrieveVote',
        controller: 'retrieveVoteController'
      })

      .when('/admin', {
        templateUrl: 'partials/admin/elections',
        controller: 'electionsController'
      })

      .when('/admin/create_user', {
        templateUrl: 'partials/admin/createUser',
        controller: 'createUserController'
      })

      .when('/admin/activate_user', {
        templateUrl: 'partials/admin/activateUser',
        controller: 'toggleUserController'
      })

      .when('/admin/create_election', {
        templateUrl: 'partials/admin/createElection',
        controller: 'createElectionController'
      })

      .when('/admin/change_card', {
        templateUrl: 'partials/admin/changeCard',
        controller: 'changeCardController'
      })

      .when('/admin/election/:param/edit', {
        templateUrl: 'partials/admin/editElection',
        controller: 'editElectionController'
      })

      .when('/admin/deactivate_users', {
        templateUrl: 'partials/admin/deactivateUsers',
        controller: 'deactivateUsersController'
      })

      .otherwise({
        templateUrl: 'partials/404'
      });
  }
];
