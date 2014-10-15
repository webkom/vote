angular.module('voteApp').service('authenticateService', function($scope, $http, $window) {
    this.isAuthenticated = function() {
        $http({method: 'GET', url: '/api/isAuthenticated'}).
            success((data, status, headers, config) => {
                if (! ('user' in data)) {
                    $window.location.href = "/";
                }
            }).
            error((data, status, headers, config) => {
                $scope.tagline = data;
            });
    };
});
