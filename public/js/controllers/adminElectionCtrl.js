angular.module('voteApp').controller('adminElectionController', function($scope, apiService) {

    if (apiService.isAuthenticated()) {
        apiService.getElection().then(function(response) {
            $scope.election = response.data;
        });
    } else {
        $scope.election = 'access denied!';
    }
});
