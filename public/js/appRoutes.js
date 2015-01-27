angular.module('voteApp').config(['$routeProvider', '$locationProvider', function ($routeProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'mainController'
        })

        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })

        .when('/election', {
            templateUrl: 'views/elections.html',
            controller: 'electionsController'
        })

        .when('/election/:param', {
            templateUrl: 'views/election.html',
            controller: 'electionController'
        })

        .when('/create_user', {
            templateUrl: 'views/createUser.html',
            controller: 'createUserController'
        })

        .when('/create_election', {
            templateUrl: 'views/createElection.html',
            controller: 'createElectionController'
        })

        .when('/election/:param/edit', {
            templateUrl: 'views/editElection.html',
            controller: 'editElectionController'
        })

        .otherwise({
            templateUrl: 'views/home.html',
            controller: 'mainController'
        });
}]);