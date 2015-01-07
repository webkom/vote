angular.module('voteApp').controller('adminElectionController', ($scope, apiService) => {

    if (apiService.isAuthenticated()) {
        apiService.getElection().then(function (response) {
            $scope.election = response.data;
        })
    } else {
        $scope.election = "access denied!";
    }
});