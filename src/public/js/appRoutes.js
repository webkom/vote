angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', ($routeProvider) => {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'mainController'
        })

        .when('/pages/vote', {
            templateUrl: 'views/vote.html',
            controller: 'voteController'
        })

        .when('/pages/admin', {
            templateUrl: 'views/admin.html',
            controller: 'adminController'
        })

        .otherwise({
            templateUrl: 'views/home.html',
            controller: 'voteController'
        });
}]);