angular.module('voteApp').controller('editElectionController', function($scope, apiService) {

    $scope.alternatives = [];
    $scope.formFeedback = '';
    $scope.title = '';
    $scope.description = '';
    $scope.activated = false;

    apiService.getElection()
        .success(function(data) {
            $scope.title = data.title;
            $scope.description = data.description;
            $scope.alternatives = data.alternatives;
            $scope.activated = data.active;
        });

    $scope.addAlternative = function(alternative) {
        apiService.addAlternative(alternative.title)
            .success(function(data) {
                $scope.alternatives.push(data);
                $scope.formFeedback = 'Alternativ lagret';
            })
            .error(function(data, status) {
                $scope.formFeedback = 'Noe gikk galt med lagring av alternativ';
            });
    };

    $scope.activateElection = function() {
        apiService.activateElection()
            .success(function(data) {
                $scope.formFeedback = 'Avstemning er aktivert';
                $scope.activated = true;
            })
            .error(function(data) {
                $scope.formFeedback = 'Ops, det skjedde en feil';
            });
    };

    $scope.deactivateElection = function() {
        apiService.deactivateElection()
            .success(function(data) {
                $scope.formFeedback = 'Avstemning er deaktivert';
                $scope.activated = false;
            })
            .error(function(data) {
                $scope.formFeedback = 'Ops, det skjedde en feil';
            });
    };

});
