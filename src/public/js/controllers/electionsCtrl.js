angular.module('voteApp').controller('electionsController', ($scope, $http) => {

    var getElections = () => {
        $http({method: 'GET', url: '/api/elections'}).
            success((data, status, headers, config) => {
                $scope.elections = data;
            }).
            error((data, status, headers, config) => {
            });

    };

    getElections();

});
