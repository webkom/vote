angular.module('voteApp').controller('electionsController',
['$scope', 'electionService', function($scope, electionService) {

    electionService.getElections()
        .success(function(data) {
            $scope.elections = data;
        });

}]);
