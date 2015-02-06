angular.module('voteApp').config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $routeProvider

        // home page
        .when('/', {
            redirectTo: '/election'
        })

        .when('/election', {
            templateUrl: 'partials/elections',
            controller: 'electionsController'
        })

        .when('/election/:param', {
            templateUrl: 'partials/election',
            controller: 'electionController'
        })

        .when('/admin/create_user', {
            templateUrl: 'partials/admin/createUser',
            controller: 'createUserController'
        })

        .when('/admin/create_election', {
            templateUrl: 'partials/admin/createElection',
            controller: 'createElectionController'
        })

        .when('/admin/election/:param/edit', {
            templateUrl: 'partials/admin/editElection',
            controller: 'editElectionController'
        })

        .otherwise({
            templateUrl: 'partials/404',
            controller: 'mainController'
        });
}]);
