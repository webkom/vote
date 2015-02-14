angular.module('voteApp').controller('editElectionController',
['$scope', 'electionService', 'adminElectionService', 'alertService',
function($scope, electionService, adminElectionService, alertService) {

    $scope.election = null;

    electionService.getElection()
        .success(function(data) {
            $scope.election = data;
        });

    $scope.addAlternative = function(alternative) {
        adminElectionService.addAlternative(alternative)
            .success(function(data) {
                $scope.election.alternatives.push(data);
                alertService.addSuccess('Alternativ lagret');
            })
            .error(function(error) {
                alertService.addError(error.message);
            });
    };

    $scope.activateElection = function() {
        adminElectionService.activateElection()
            .success(function(data) {
                alertService.addSuccess('Avstemning er aktivert');
                $scope.election.activated = true;
            })
            .error(function(error) {
                alertService.addError(error.message);
            });
    };

    $scope.deactivateElection = function() {
        adminElectionService.deactivateElection()
            .success(function(data) {
                alertService.addSuccess('Avstemning er deaktivert');
                $scope.election.activated = false;
            })
            .error(function(error) {
                alertService.addError(error.message);
            });
    };

}]);
