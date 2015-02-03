angular.module('voteApp').controller('editElectionController', function($scope, apiService) {

    $scope.alternatives = [];
    $scope.formFeedback = '';

    apiService.getElection()
        .success(function(data) {
            $scope.alternatives = data.alternatives;
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

});
