module.exports = [
  '$scope',
  '$window',
  'electionService',
  'alertService',
  'voteService',
  'socketIOService',
  'localStorageService',
  function (
    $scope,
    $window,
    electionService,
    alertService,
    voteService,
    socketIOService,
    localStorageService
  ) {
    $scope.activeElection = null;
    $scope.priorities = [];

    /**
     * Tries to find an active election
     */
    function getActiveElection() {
      return electionService.getActiveElection().then(
        function (response) {
          $scope.activeElection = response.data;
        },
        function (response) {
          alertService.addError(response.data.message);
        }
      );
    }
    getActiveElection();
    socketIOService.listen('election', getActiveElection);

    $scope.getPossibleAlternatives = function () {
      return $scope.activeElection.alternatives.filter(
        (e) => !$scope.priorities.includes(e)
      );
    };

    $scope.updatePriority = function (oldIndex, newIndex) {
      const alternative = $scope.priorities.splice(oldIndex, 1)[0];
      $scope.priorities.splice(newIndex, 0, alternative);
    };

    /**
     * Adds the given alternative to $scope.priorities
     * @param  {Object} alternative
     */
    $scope.selectAlternative = function (alternative) {
      $scope.priorities.push(alternative);
    };

    /**
     * Removes the given alternative to $scope.priorities
     * @param  {Object} alternative
     */
    $scope.deselectAlternative = function (alternative) {
      $scope.priorities = $scope.priorities.filter((a) => a !== alternative);
    };

    /**
     * Persists votes to the backend
     */
    $scope.vote = function () {
      voteService.vote($scope.activeElection, $scope.priorities).then(
        function (response) {
          $window.scrollTo(0, 0);
          $scope.activeElection = null;
          alertService.addSuccess('Takk for din stemme!');
          localStorageService.set('voteHash', response.data.hash);
          getActiveElection();
        },
        function (response) {
          $window.scrollTo(0, 0);
          getActiveElection();
          switch (response.data.name) {
            case 'InactiveElectionError':
              alertService.addError(
                'Denne avstemningen ser ut til å være deaktivert, vennligst prøv igjen.'
              );
              break;
            case 'AlreadyVotedError':
              alertService.addError(
                'Du kan bare stemme en gang per avstemning!'
              );
              break;
            case 'InactiveUserError':
              alertService.addError(
                'Brukeren din er deaktivert, vennligst henvend deg til skranken.'
              );
              break;
            default:
              alertService.addError('Noe gikk galt, vennligst prøv igjen.');
          }
        }
      );
    };

    /**
     * Helper function to determine if an alternative is selected
     * @param  {Object}  alternative
     * @return {Boolean}
     */
    $scope.isChosen = function (alternative) {
      return $scope.priorities.includes(alternative);
    };
  },
];
