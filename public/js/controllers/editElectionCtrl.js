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

    $scope.toggleElection = function() {
        if ($scope.election.active === true) {
            adminElectionService.deactivateElection()
                .success(function(data) {
                    alertService.addSuccess('Avstemning er deaktivert');
                })
                .error(function(error) {
                    alertService.addError(error.message);
                });
        } else {
            adminElectionService.activateElection()
                .success(function(data) {
                    alertService.addSuccess('Avstemning er aktivert');
                })
                .error(function(error) {
                    alertService.addError(error.message);
                });
        }
    };

}]);
