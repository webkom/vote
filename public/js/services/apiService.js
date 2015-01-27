angular.module('voteApp').service('apiService', function ($http, $routeParams) {

    this.user = {
        loggedIn: false,
        username: '',
        admin: false
    };

    this.setUser = function (user) {
        this.user.loggedIn = true;
        this.username = user.username;
        this.admin = user.admin;
    }

    this.isAuthenticated = function () {
        return $http({method: 'POST', url: '/auth/isAuthenticated'}).
            success(function (data, status, headers, config) {
                return data;
            }).
            error(function (data, status, headers, config) {
                return data;
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

    this.createElection = function (title, description) {
        var promise = $http({method: 'POST', data: {title: title, description: description}, url: '/api/election/'}).
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

    this.addAlternative = function (title) {
        var promise = $http({method: 'POST', data: {title: title, description: title}, url: '/api/election/' + $routeParams.param + '/alternatives'}).
            success(function (data, status, headers, config) {
                return data;

            }).
            error(function (data, status, headers, config) {
                return data;
            });
        return promise;
    };

});