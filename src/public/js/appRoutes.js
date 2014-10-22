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

        .otherwise({
            templateUrl: 'views/home.html',
            controller: 'mainController'
        });
}]);