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
    };

    this.getElections = function () {
        return $http({method: 'GET', url: '/api/election'}).

            success(function (data, status, headers, config) {
                return data;
            }).
            error(function (data, status, headers, config) {
                return data;
            });
    };

    this.createElection = function (title, description) {
        return $http({method: 'POST', data: {title: title, description: description}, url: '/api/election/'}).
            success(function (data, status, headers, config) {
                return data;
            }).
            error(function (data, status, headers, config) {
                return data;
            });
    };

    this.getElection = function () {
        return $http({method: 'GET', url: '/api/election/' + $routeParams.param}).
            success(function (data, status, headers, config) {
                return data;
            }).
            error(function (data, status, headers, config) {
                return data;
            });
    };

    this.login = function (username, password) {
        return $http({method: 'POST', data: {username: username, password: password}, url: '/auth/login'}).
            success(function (data, status, headers, config) {
                return data;

            }).
            error(function (data, status, headers, config) {
                return data;
            });
    };

    this.addAlternative = function (title) {
        return $http({method: 'POST', data: {title: title, description: title}, url: '/api/election/' + $routeParams.param + '/alternatives'}).
            success(function (data, status, headers, config) {
                return data;

            }).
            error(function (data, status, headers, config) {
                return data;
            });
    };

});