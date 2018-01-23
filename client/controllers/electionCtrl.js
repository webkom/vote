module.exports = [
  '$scope',
  '$window',
  'electionService',
  'alertService',
  'voteService',
  'socketIOService',
  'localStorageService',
  function(
    $scope,
    $window,
    electionService,
    alertService,
    voteService,
    socketIOService,
    localStorageService
  ) {
    $scope.activeElection = null;
    $scope.selectedAlternative = null;

    /**
     * Tries to find an active election
     */
    function getActiveElection() {
      return electionService
        .getActiveElection()
        .success(function(election) {
          $scope.activeElection = election;
        })
        .error(function(err) {
          alertService.addError(err.message);
        });
    }
    getActiveElection();
    socketIOService.listen('election', getActiveElection);

    /**
     * Sets the given alternative to $scope
     * @param  {Object} alternative
     */
    $scope.selectAlternative = function(alternative) {
      $scope.selectedAlternative = alternative;
    };

    /**
     * Persists votes to the backend
     */
    $scope.vote = function() {
      voteService
        .vote($scope.selectedAlternative._id)
        .success(function(vote) {
          $window.scrollTo(0, 0);
          $scope.activeElection = null;
          alertService.addSuccess('Takk for din stemme!');
          localStorageService.set('voteHash', vote.hash);
          getActiveElection();
        })
        .error(function(error) {
          $window.scrollTo(0, 0);
          getActiveElection();
          switch (error.name) {
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
        });
    };

    /**
     * Helper function to determine if an alternative is selected
     * @param  {Object}  alternative
     * @return {Boolean}
     */
    $scope.isChosen = function(alternative) {
      return alternative === $scope.selectedAlternative;
    };
  }
];
