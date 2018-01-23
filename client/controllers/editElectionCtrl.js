module.exports = [
  '$scope',
  '$interval',
  '$location',
  'userService',
  'adminElectionService',
  'alertService',
  function(
    $scope,
    $interval,
    $location,
    userService,
    adminElectionService,
    alertService
  ) {
    $scope.newAlternative = {};
    $scope.election = null;
    $scope.showCount = false;
    var countInterval;

    function handleIntervalError(error) {
      $interval.cancel(countInterval);
      alertService.addError(error.message);
    }

    function countActiveUsers() {
      userService
        .countActiveUsers()
        .success(function(result) {
          $scope.activeUsers = result.users;
        })
        .error(handleIntervalError);
    }
    countActiveUsers();

    function countVotedUsers() {
      adminElectionService
        .countVotedUsers()
        .success(function(result) {
          $scope.votedUsers = result.users;
        })
        .error(handleIntervalError);
    }
    countVotedUsers();

    countInterval = $interval(function() {
      countActiveUsers();
      countVotedUsers();
    }, 3000);

    $scope.$on('$destroy', function() {
      $interval.cancel(countInterval);
    });

    adminElectionService.getElection().success(function(data) {
      $scope.election = data;
    });

    $scope.addAlternative = function(alternative) {
      adminElectionService
        .addAlternative(alternative)
        .success(function(data) {
          $scope.election.alternatives.push(data);
          $scope.newAlternative = {};
          $scope.alternativeForm.$setPristine();
          alertService.addSuccess('Alternativ lagret');
        })
        .error(function(error) {
          alertService.addError(error.message);
        });
    };

    $scope.toggleElection = function() {
      if ($scope.election.active) {
        adminElectionService
          .deactivateElection()
          .success(function(data) {
            $scope.election.active = data.active;
            alertService.addWarning('Avstemning er deaktivert');
          })
          .error(function(error) {
            alertService.addError(error.message);
          });
      } else {
        adminElectionService
          .activateElection()
          .success(function(data) {
            $scope.election.active = data.active;
            alertService.addSuccess('Avstemning er aktivert');
          })
          .error(function(error) {
            alertService.addError(error.message);
          });
      }
    };

    function getCount() {
      adminElectionService
        .countVotes()
        .success(function(alternatives) {
          $scope.election.alternatives.forEach(function(alternative) {
            alternatives.some(function(resultAlternative) {
              if (resultAlternative.alternative === alternative._id) {
                alternative.votes = resultAlternative.votes;
                return true;
              }

              return false;
            });
          });
        })
        .error(handleIntervalError);
    }

    $scope.getPercentage = function(count) {
      if (count !== undefined) {
        var sum = 0;
        $scope.election.alternatives.forEach(function(alternative) {
          sum += alternative.votes;
        });

        return Math.round(count / sum * 100);
      }
    };

    $scope.toggleCount = function() {
      $scope.showCount = !$scope.showCount;
      if ($scope.showCount) {
        getCount();
      }
    };

    $scope.copyElection = function() {
      var alternatives = $scope.election.alternatives.map(function(
        alternative
      ) {
        return { description: alternative.description };
      });

      var election = {
        title: $scope.election.title,
        description: $scope.election.description,
        alternatives: alternatives
      };

      $location
        .path('/admin/create_election')
        .search({ election: JSON.stringify(election) });
    };
  }
];
