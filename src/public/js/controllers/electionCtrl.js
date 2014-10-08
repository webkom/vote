angular.module('electionCtrl', []).controller('electionController', ($scope, $http) => {

    var getElections = () => {
        $http({method: 'GET', url: '/api/elections'}).
            success((data, status, headers, config) => {
                $scope.tagline = 'Success';
                $scope.elections = data;
            }).
            error((data, status, headers, config) => {
                $scope.tagline = data;
            });

    };

    getElections();

});