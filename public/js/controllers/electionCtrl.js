angular.module('voteApp').controller('electionController',
['$scope', 'electionService', 'alertService', 'voteService', 'localStorageService', 'socketIOService',
function($scope, electionService, alertService, voteService, localStorageService, socketIOService) {

    $scope.activeElection = null;
    $scope.selectedAlternative = null;

    // Initialize local storage
    var alreadyVotedElections = localStorageService.get('alreadyVotedElections');
    if (!alreadyVotedElections) localStorageService.set('alreadyVotedElections', []);

    /**
     * Tries to find an active election
     */
    function getActiveElection() {
        return electionService.getElections()
            .success(function(elections) {
                $scope.elections = elections;

                var alreadyVotedElections = localStorageService.get('alreadyVotedElections');
                $scope.elections.some(function(election) {
                    if (election.active && alreadyVotedElections.indexOf(election._id) === -1) {
                        $scope.activeElection = election;
                        return true;
                    }
                    $scope.activeElection = null;
                });
            })
            .error(function(err) {
                alertService.addError(err.message);
            });
    }
    getActiveElection();
    socketIOService.listen('election', getActiveElection);

    /**
     * Add the given electionId to local storage, to ensure that
     * it won't show up the next time the page is loaded
     * @param {Object} electionId
     */
    function addVotedElection(electionId) {
        $scope.activeElection = null;
        var alreadyVotedElections = localStorageService.get('alreadyVotedElections');
        localStorageService.set('alreadyVotedElections', alreadyVotedElections.concat(electionId));
    }

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
        voteService.vote($scope.selectedAlternative._id)
            .success(function(result) {
                $scope.voteFeedback = 'Takk for din stemme.';
                addVotedElection($scope.activeElection._id);
            })
            .error(function(error) {
                switch (error.name) {
                    case 'InactiveElectionError':
                        alertService.addError('Denne avstemningen ser ut til å være deaktivert, vennligst prøv igjen.');
                        getActiveElection();
                        break;
                    case 'AlreadyVotedError':
                        addVotedElection($scope.activeElection._id);
                        alertService.addError('Du kan bare stemme en gang per avstemning!');
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
}]);
