angular.module('voteApp').controller('electionsController', ($scope, $http) => {

    var getElections = () => {
        $http({method: 'GET', url: '/api/election'}).
            success((data, status, headers, config) => {
                console.log(data);
                $scope.elections = data;
            }).
            error((data, status, headers, config) => {
            });

    };

    getElections();

});
