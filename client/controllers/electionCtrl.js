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
    $scope.electionExists = false;
    $scope.priorities = [];
    $scope.confirmVote = false;
    $scope.correctCode = false;
    $scope.accessCode = '';

    /**
     * Tries to find an active election
     */
    function getActiveElection(accessCode) {
      return electionService.getActiveElection(accessCode).then(
        function (response) {
          $scope.priorities = [];
          $scope.electionExists = true;
          $scope.activeElection = response.data;
          $scope.correctCode = true;
        },
        function (response) {
          if (response.status == '404') {
            $scope.electionExists = false;
            $scope.activeElection = null;
            $scope.accessCode = '';
            $scope.correctCode = false;
          } else if (response.status == '403') {
            $scope.electionExists = true;
            $scope.activeElection = null;
            $scope.accessCode = '';
            $scope.correctCode = false;
          } else {
            alertService.addError(response.data.message);
          }
        }
      );
    }
    getActiveElection();
    $scope.getActiveElection = getActiveElection;
    socketIOService.listen('election', getActiveElection);

    $scope.getPossibleAlternatives = function () {
      return $scope.activeElection.alternatives.filter(
        (e) => !$scope.priorities.includes(e)
      );
    };

    /**
     * Update the priorities with a sortable event.
     * @param {Object} evt
     */
    $scope.updatePriority = function (evt) {
      const { oldIndex, newIndex } = evt;
      const alternative = $scope.priorities.splice(oldIndex, 1)[0];
      $scope.priorities.splice(newIndex, 0, alternative);

      // There might be a bug where angular does not re-render, so we force refresh
      $scope.$apply();
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
     * @param  {string} id
     */
    $scope.deselectAlternative = function (id) {
      $scope.priorities = $scope.priorities.filter((a) => a._id !== id);
    };

    $scope.confirm = function () {
      $scope.confirmVote = true;
    };

    $scope.denyVote = function () {
      $scope.confirmVote = false;
    };

    /**
     * Persists votes to the backend
     */
    $scope.vote = function () {
      voteService.vote($scope.activeElection, $scope.priorities).then(
        function (response) {
          $window.scrollTo(0, 0);
          $scope.activeElection = null;
          $scope.priorities = [];
          $scope.electionExists = false;
          $scope.confirmVote = false;
          $scope.correctCode = false;
          $scope.accessCode = '';
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
