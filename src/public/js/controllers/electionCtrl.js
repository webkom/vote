angular.module('voteApp').controller('electionController', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) => {

    var getElection = () => {
        $http({method: 'GET', url: '/api/elections/' + $routeParams.param}).
            success((data, status, headers, config) => {
                $scope.election = data;
            }).
            error((data, status, headers, config) => {
                $scope.election = data;
            });

    };

    getElection();
}]);
