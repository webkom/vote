angular.module('voteApp').controller('electionController',
['$scope', 'apiService', 'alertService', function($scope, apiService, alertService) {

    apiService.getElections()
    $scope.activeElection = null;
    $scope.selectedAlternative = null;
    $scope.voteText = $scope.selectedAlternative ? 'Stem på ' + $scope.selectedAlternative.description : 'Velg et alternativ';

    apiService.getElections()
        .success(function(elections) {
            $scope.elections = elections;
            $scope.elections.some(function(election) {
                if (election.active) {
                    $scope.activeElection = election;
                    return true;
                }
            });
        })
        .error(function(err) {
            alertService.addError(err.message);
        });

    $scope.selectAlternative = function(alternative) {
        $scope.selectedAlternative = alternative;
    };

    $scope.vote = function() {
        console.log('voting');
    };

    $scope.isChosen = function(alternative) {
        return alternative === $scope.selectedAlternative;
    };
}]);
