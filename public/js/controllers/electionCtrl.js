angular.module('voteApp').controller('electionController', function($scope, apiService) {

    apiService.getElection().then(function(response) {
        var data = response.data;
        $scope.title = data.title;
        $scope.description = data.description;
        $scope.alternatives = data.alternatives;
    });
});
