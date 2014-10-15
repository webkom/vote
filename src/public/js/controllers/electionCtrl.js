angular.module('voteApp').controller('electionController', ($scope, $http) => {

    var getElections = () => {
        $http({method: 'GET', url: '/api/election'}).
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