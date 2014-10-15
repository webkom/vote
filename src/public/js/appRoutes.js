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

        .when('/elections', {
            templateUrl: 'views/elections.html',
            controller: 'electionController'
        })

        .when('/elections/:param', {
            templateUrl: 'views/election.html',
            controller: 'electionsController'
        })

        .otherwise({
            templateUrl: 'views/home.html',
            controller: 'mainController'
        });
}]);