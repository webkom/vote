angular.module('voteApp').controller('electionController',
['$scope', 'apiService', 'alertService', function($scope, apiService, alertService) {

    $scope.election = {};

    apiService.getElection()
        .success(function(election) {
            $scope.election = election;
        })
        .error(function(err) {
            alertService.addError(err.message);
        });
}]);
