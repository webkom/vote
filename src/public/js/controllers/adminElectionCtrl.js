angular.module('voteApp').controller('adminElectionController', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) => {

    var isAuthenticated = () => {
        $http({method: 'GET', url: '/api/isAuthenticated'}).
            success((data, status, headers, config) => {
                if (! ('user' in data)) {
                    $scope.election = "Access denied!"
                } else {
                    getElection();
                }
            }).
            error((data, status, headers, config) => {
                $scope.election = data;
            });
    };

    var getElection = () => {
        $http({method: 'GET', url: '/api/election/' + $routeParams.param}).
            success((data, status, headers, config) => {
                $scope.election = data;
            }).
            error((data, status, headers, config) => {
                $scope.election = data;
            });
    };

    isAuthenticated();
}]);