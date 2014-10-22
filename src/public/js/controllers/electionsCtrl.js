angular.module('electionsCtrl', []).controller('electionsController', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) => {

    var getElection = () => {
        $http({method: 'GET', url: '/api/election/' + $routeParams.param}).
            success((data, status, headers, config) => {
                $scope.election = data;
            }).
            error((data, status, headers, config) => {
                $scope.election = data;
            });

    };

    getElection();
}]);