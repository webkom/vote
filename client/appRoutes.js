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

      .when('/moderator', {
        templateUrl: 'partials/moderator/createUser',
        controller: 'createUserController'
      })

      .when('/moderator/create_user', {
        templateUrl: 'partials/moderator/createUser',
        controller: 'createUserController'
      })

      .when('/moderator/qr', {
        templateUrl: 'partials/moderator/qr',
        controller: 'createQRController'
      })

      .when('/moderator/showqr', {
        templateUrl: 'partials/moderator/showqr',
        controller: 'showQRController'
      })

      .when('/moderator/serial_error', {
        templateUrl: 'partials/moderator/serial_error'
      })

      .when('/moderator/activate_user', {
        templateUrl: 'partials/moderator/activateUser',
        controller: 'toggleUserController'
      })

      .when('/admin/create_election', {
        templateUrl: 'partials/admin/createElection',
        controller: 'createElectionController'
      })

      .when('/moderator/change_card', {
        templateUrl: 'partials/moderator/changeCard',
        controller: 'changeCardController'
      })

      .when('/admin/election/:param/edit', {
        templateUrl: 'partials/admin/editElection',
        controller: 'editElectionController'
      })

      .when('/moderator/deactivate_users', {
        templateUrl: 'partials/moderator/deactivateUsers',
        controller: 'deactivateUsersController'
      })

      .otherwise({
        templateUrl: 'partials/404'
      });
  }
];
