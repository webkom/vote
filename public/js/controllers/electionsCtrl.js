angular.module('voteApp').controller('electionsController',
['$scope', 'adminElectionService', function($scope, adminElectionService) {
    adminElectionService.getElections()
        .success(function(data) {
            $scope.elections = data;
        });
}]);
