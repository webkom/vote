angular.module('voteApp').controller('createElectionController', function($scope, apiService) {

    $scope.createElection = function(election) {
        if (election && election.title) {
            apiService.createElection(election.title, election.description).then(function(response) {
                console.log(response.status);
                if (response.status === 201) {
                    $scope.formFeedback = 'Avstemnningen ble lagret';
                } else {
                    $scope.formFeedback = 'Ops, noe gikk galt med lagring av avstemning';
                }
            });
        } else {
            $scope.formFeedback = 'Tittel må fylles inn';
        }
    };

    $scope.formFeedback = '';
});
