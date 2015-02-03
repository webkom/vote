angular.module('voteApp').controller('electionController', function($scope, apiService) {

    $scope.election = {};

    apiService.getElection().then(function(response) {
        var data = response.data;
        $scope.id = data._id;
        $scope.title = data.title;
        $scope.description = data.description;
        $scope.alternatives = data.alternatives;
    });
});
