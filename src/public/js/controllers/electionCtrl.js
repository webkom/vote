angular.module('voteApp').controller('electionController', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) => {

    var getElection = () => {
        $http({method: 'GET', url: '/api/election/' + $routeParams.param}).
            success((data, status, headers, config) => {
                $scope.title = data['title'];
                $scope.description = data['description'];
                $scope.alternatives = data['alternatives'];
            }).
            error((data, status, headers, config) => {
                $scope.title = data;
            });

    };

    getElection();
}]);
