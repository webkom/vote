angular.module('voteApp').controller('electionController',
['$scope', 'apiService', 'alertService', function($scope, apiService, alertService) {

    $scope.election = null;
    $scope.id = -1;

    apiService.getElection()
        .success(function(election) {
            $scope.election = election;
            $scope.id = election._id;
        })
        .error(function(err) {
            alertService.addError(err.message);
        });
}]);
