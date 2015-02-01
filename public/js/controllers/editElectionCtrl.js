angular.module('voteApp').controller('editElectionController', function($scope, apiService) {

    $scope.alternatives = [];
    $scope.formFeedback = '';

    apiService.getElection().then(function(response) {
        $scope.alternatives = response.data.alternatives;
    });

    $scope.addAlternative = function(alternative) {
        if (alternative) {
            apiService.addAlternative(alternative.title).then(function(response) {
                console.log(response.data);
                $scope.alternatives.push(response.data);

            });
        } else {
            $scope.formFeedback = 'Alternativfeltet kan ikke være tomt';
        }
    };

});
