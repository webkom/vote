angular.module('voteApp').service('apiService', function ($http, $routeParams) {

    this.isAuthenticated = function () {
        return $http({method: 'POST', url: '/auth/isAuthenticated'}).
            success(function (data, status, headers, config) {
                return data;
            }).
            error(function (data, status, headers, config) {
            });
    };

    this.getElections = function () {
        var promise = $http({method: 'GET', url: '/api/election'}).

            success(function (data, status, headers, config) {
                return data;
            }).
            error(function (data, status, headers, config) {
                return data;
            });

        return promise;
    };

    this.getElection = function () {
        var promise = $http({method: 'GET', url: '/api/election/' + $routeParams.param}).
            success(function (data, status, headers, config) {
                return data;
            }).
            error(function (data, status, headers, config) {
                return data;
            });
        return promise;
    };

    this.login = function (username, password) {
        var promise = $http({method: 'POST', data: {username: username, password: password}, url: '/auth/login'}).
            success(function (data, status, headers, config) {
                return data;

            }).
            error(function (data, status, headers, config) {
                return data;
            });
        return promise;
    };

});