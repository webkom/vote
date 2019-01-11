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
        .then(function(response) {
          alertService.addSuccess('Avstemning lagret');
          $location.path('/admin/election/' + response.data._id + '/edit');
        }, function(response) {
          alertService.addError(response.data.message);
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
