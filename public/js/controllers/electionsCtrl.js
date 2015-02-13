angular.module('voteApp').controller('electionsController', function($scope, apiService) {

    apiService.getElections()
        .success(function(data) {
            $scope.elections = data;
        });

});
