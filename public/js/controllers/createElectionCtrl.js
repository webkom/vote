angular.module('voteApp').controller('createElectionController', function($scope, apiService) {

    $scope.formFeedback = '';

    $scope.createElection = function(election) {
        apiService.createElection(election.title, election.description)
            .success(function(data) {
                $scope.formFeedback = 'Avstemning lagret';
            })
            .error(function(data) {
                $scope.formFeedback = 'Noe gikk galt ved lagring av avstemning';
            });
    };
});
