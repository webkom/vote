angular.module('voteApp').controller('electionsController', function($scope, apiService){

    apiService.getElections().then(function(response) {
        $scope.elections = response.data;
    });

});
