angular.module('voteApp').controller('createElectionController',
['$scope', '$location', 'apiService', 'alertService',
function($scope, $location, apiService, alertService) {

    $scope.election = {
        alternatives: [{}]
    };

    $scope.createElection = function(election) {
        apiService.createElection(election)
            .success(function(data) {
                alertService.addSuccess('Avstemning lagret');
                $location.path('/admin/election/' + data._id + '/edit');
            })
            .error(function(error) {
                alertService.addError(error.message);
            });
    };

    $scope.addAlternative = function() {
        $scope.election.alternatives.push({});
    };

    $scope.deleteAlternative = function(alternative) {
        var index = $scope.election.alternatives.indexOf(alternative);
        $scope.election.alternatives.splice(index, 1);
    };
}]);
