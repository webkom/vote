
angular.module('voteApp').service('adminService', function($http) {

    this.isAuthenticated = function() {
        return $http({method: 'GET', url: '/api/isAuthenticated'}).
            success(function(data, status, headers, config) {
                return (! ('user' in data));
            }).
            error(function(data, status, headers, config) {
            });
    };

    this.getElections = function() {
        var promise = $http({method: 'GET', url: '/api/election'}).

            success(function(data, status, headers, config) {
                return data;
            }).
            error(function(data, status, headers, config) {
                return data;
            });

        return promise;
    };

});