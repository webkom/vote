angular.module('voteApp').service('apiService', function($http, $routeParams) {

    this.user = {
        loggedIn: false,
        username: '',
        admin: false
    };

    this.setUser = function(data) {
        this.user.loggedIn = true;
        this.username = data.username;
        this.admin = data.admin;
    };

    this.getElections = function() {
        return $http({ method: 'GET', url: '/api/election' });
    };

    this.createElection = function(title, description) {
        return $http({ method: 'POST', data: {title: title, description: description}, url: '/api/election/' });
    };

    this.getElection = function() {
        return $http({ method: 'GET', url: '/api/election/' + $routeParams.param }).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
            });
    };

    this.login = function(username, password) {
        return $http({ method: 'POST', data: {username: username, password: password}, url: '/auth/login' });
    };

    this.addAlternative = function(title) {
        return $http({ method: 'POST', data: {title: title, description: title}, url: '/api/election/' + $routeParams.param + '/alternatives' });
    };

});
