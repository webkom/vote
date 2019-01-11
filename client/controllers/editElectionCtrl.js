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

    function handleIntervalError(response) {
      $interval.cancel(countInterval);
      alertService.addError(response.data.message);
    }

    function countActiveUsers() {
      userService.countActiveUsers().then(function(response) {
        $scope.activeUsers = response.data.users;
      }, handleIntervalError);
    }
    countActiveUsers();

    function countVotedUsers() {
      adminElectionService.countVotedUsers().then(function(response) {
        $scope.votedUsers = response.data.users;
      }, handleIntervalError);
    }
    countVotedUsers();

    countInterval = $interval(function() {
      countActiveUsers();
      countVotedUsers();
    }, 3000);

    $scope.$on('$destroy', function() {
      $interval.cancel(countInterval);
    });

    adminElectionService.getElection().then(function(response) {
      $scope.election = response.data;
    });

    $scope.addAlternative = function(alternative) {
      adminElectionService.addAlternative(alternative).then(
        function(response) {
          $scope.election.alternatives.push(response.data);
          $scope.newAlternative = {};
          $scope.alternativeForm.$setPristine();
          alertService.addSuccess('Alternativ lagret');
        },
        function(response) {
          alertService.addError(response.data.message);
        }
      );
    };

    $scope.toggleElection = function() {
      if ($scope.election.active) {
        adminElectionService.deactivateElection().then(
          function(response) {
            $scope.election.active = response.data.active;
            alertService.addWarning('Avstemning er deaktivert');
          },
          function(response) {
            alertService.addError(response.data.message);
          }
        );
      } else {
        adminElectionService.activateElection().then(
          function(response) {
            $scope.election.active = response.data.active;
            alertService.addSuccess('Avstemning er aktivert');
          },
          function(response) {
            alertService.addError(response.data.message);
          }
        );
      }
    };

    function getCount() {
      adminElectionService.countVotes().then(function(response) {
        $scope.election.alternatives.forEach(function(alternative) {
          response.data.some(function(resultAlternative) {
            if (resultAlternative.alternative === alternative._id) {
              alternative.votes = resultAlternative.votes;
              return true;
            }

            return false;
          });
        });
      }, handleIntervalError);
    }

    $scope.getPercentage = function(count) {
      if (count !== undefined) {
        var sum = 0;
        $scope.election.alternatives.forEach(function(alternative) {
          sum += alternative.votes;
        });

        return Math.round((count / sum) * 100);
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
