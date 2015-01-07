angular.module('voteApp').controller('electionsController', ($scope, apiService) => {

    apiService.getElections().then(function (response) {
        $scope.elections = response.data;
    })

});
