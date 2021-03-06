module.exports = [
  '$scope',
  '$interval',
  '$location',
  'userService',
  'adminElectionService',
  'alertService',
  function (
    $scope,
    $interval,
    $location,
    userService,
    adminElectionService,
    alertService
  ) {
    $scope.newAlternative = {};
    $scope.election = null;
    $scope.showResult = false;
    var countInterval;

    function handleIntervalError(response) {
      $interval.cancel(countInterval);
      alertService.addError(response.data.message);
    }

    function countActiveUsers() {
      userService.countActiveUsers().then(function (response) {
        $scope.activeUsers = response.data.users;
      }, handleIntervalError);
    }
    countActiveUsers();

    function countVotedUsers() {
      adminElectionService.countVotedUsers().then(function (response) {
        $scope.votedUsers = response.data.users;
      }, handleIntervalError);
    }
    countVotedUsers();

    countInterval = $interval(function () {
      countActiveUsers();
      countVotedUsers();
    }, 3000);

    $scope.$on('$destroy', function () {
      $interval.cancel(countInterval);
    });

    adminElectionService.getElection().then(function (response) {
      $scope.election = response.data;
    });

    $scope.addAlternative = function (alternative) {
      adminElectionService.addAlternative(alternative).then(
        function (response) {
          $scope.election.alternatives.push(response.data);
          $scope.newAlternative = {};
          $scope.alternativeForm.$setPristine();
          alertService.addSuccess('Alternativ lagret');
        },
        function (response) {
          alertService.addError(response.data.message);
        }
      );
    };

    function clearResults() {
      $scope.showResult = false;
      $scope.election.result = {};
      $scope.election.log = [];
    }

    $scope.toggleElection = function () {
      clearResults();
      if ($scope.election.active) {
        adminElectionService.deactivateElection().then(
          function (response) {
            $scope.election.active = response.data.active;
            alertService.addWarning('Avstemning er deaktivert');
          },
          function (response) {
            alertService.addError(response.data.message);
          }
        );
      } else {
        adminElectionService.activateElection().then(
          function (response) {
            $scope.election.active = response.data.active;
            alertService.addSuccess('Avstemning er aktivert');
          },
          function (response) {
            alertService.addError(response.data.message);
          }
        );
      }
    };

    $scope.getPercentage = function (count) {
      if (count !== undefined) {
        var sum = 0;
        $scope.election.alternatives.forEach(function (alternative) {
          sum += alternative.votes;
        });

        return Math.round((count / sum) * 100);
      }
    };

    $scope.toggleResult = function () {
      $scope.showResult = !$scope.showResult;
      if ($scope.showResult) {
        adminElectionService.elect().then(function (response) {
          $scope.election = {
            ...$scope.election,
            ...response.data,
            status:
              response.data.result.status == 'RESOLVED' ? 'success' : 'warning',
          };
        });
      } else {
        clearResults();
      }
    };

    $scope.copyElection = function () {
      var alternatives = $scope.election.alternatives.map(function (
        alternative
      ) {
        return { description: alternative.description };
      });

      var election = {
        title: $scope.election.title,
        description: $scope.election.description,
        alternatives: alternatives,
      };

      $location
        .path('/admin/create_election')
        .search({ election: JSON.stringify(election) });
    };

    $scope.copyToClipboard = function (text) {
      const copyEl = document.createElement('textarea');
      copyEl.style.opacity = '0';
      copyEl.style.position = 'fixed';
      copyEl.textContent = text;
      document.body.appendChild(copyEl);
      copyEl.select();
      try {
        document.execCommand('copy');
        $scope.copySuccess = true;
        setTimeout(() => ($scope.copySuccess = null), 1000);
      } finally {
        document.body.removeChild(copyEl);
      }
    };
  },
];
