angular.module('voteApp').controller('editElectionController', function($scope, apiService, alertService) {

    $scope.election = false;

    apiService.getElection()
        .success(function(data) {
            $scope.election = data;
        });

    $scope.addAlternative = function(alternative) {
        apiService.addAlternative(alternative.title)
            .success(function(data) {
                $scope.election.alternatives.push(data);
                alertService.addSuccess('Alternativ lagret');
            })
            .error(function(data, status) {
                alertService.addError('Noe gikk galt med lagring av alternativ');
            });
    };

    $scope.activateElection = function() {
        apiService.activateElection()
            .success(function(data) {
                alertService.addSuccess('Avstemning er aktivert');
                $scope.election.activated = true;
            })
            .error(function(data) {
                alertService.addError();
            });
    };

    $scope.deactivateElection = function() {
        apiService.deactivateElection()
            .success(function(data) {
                alertService.addSuccess('Avstemning er deaktivert');
                $scope.election.activated = false;
            })
            .error(function(data) {
                alertService.addError();
            });
    };

});
