angular.module('voteApp').controller('adminController', ($scope, $http, $window) => {

    var isAuthenticated = () => {
        $http({method: 'GET', url: '/api/isAuthenticated'}).
            success((data, status, headers, config) => {
                if (! ('user' in data)) {
                    $window.location.href = "/";
                } else {
                    getElections();
                }
            }).
            error((data, status, headers, config) => {
            });
    };

    var getElections = () => {
        $http({method: 'GET', url: '/api/election'}).
            success((data, status, headers, config) => {
                $scope.elections = data;
            }).
            error((data, status, headers, config) => {
            });

    };

    isAuthenticated();

});