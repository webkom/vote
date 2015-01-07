angular.module('voteApp').controller('electionController', ($scope, apiService) => {

    apiService.getElection().then(function (response) {
        var data = response.data;
        $scope.title = data['title'];
        $scope.description = data['description'];
        $scope.alternatives = data['alternatives'];
    })
});
