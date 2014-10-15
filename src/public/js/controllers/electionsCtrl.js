angular.module('voteApp').controller('electionsController', ($scope, $http) => {

    var getElection = () => {
        $http({method: 'GET', url: '/api/election/' + $routeParams.param}).
            success((data, status, headers, config) => {
                $scope.tagline = 'Success';
                $scope.elections = data;
            }).
            error((data, status, headers, config) => {
                $scope.tagline = data;
            });

    };

    getElection();

});
