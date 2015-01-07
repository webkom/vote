angular.module('voteApp').config(['$routeProvider', '$locationProvider', ($routeProvider) => {

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

        .when('/admin/election', {
            templateUrl: 'views/admin.html',
            controller: 'adminController'
        })

        .when('/admin/election/:param', {
            templateUrl: 'views/adminElection.html',
            controller: 'adminElectionController'
        })

        .otherwise({
            templateUrl: 'views/home.html',
            controller: 'mainController'
        });
}]);