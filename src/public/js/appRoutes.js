angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', ($routeProvider) => {

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

        .when('/vote', {
            templateUrl: 'views/vote.html',
            controller: 'voteController'
        })

        .otherwise({
            templateUrl: 'views/home.html',
            controller: 'voteController'
        });
}]);