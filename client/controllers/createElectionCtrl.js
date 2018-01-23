module.exports = [
  '$scope',
  '$location',
  'adminElectionService',
  'alertService',
  function($scope, $location, adminElectionService, alertService) {
    var existingElection = $location.search().election;
    if (existingElection) {
      $scope.election = JSON.parse(existingElection);
    } else {
      $scope.election = {
        alternatives: [{}]
      };
    }

    $scope.createElection = function(election) {
      adminElectionService
        .createElection(election)
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
  }
];
