angular.module('voteApp').controller('createElectionController', function($scope, apiService, alertService) {

    $scope.createElection = function(election) {
        apiService.createElection(election.title, election.description)
            .success(function(data) {
                alertService.addSuccess('Avstemning lagret');
            })
            .error(function(data) {
                alertService.addError();
            });
    };
});
