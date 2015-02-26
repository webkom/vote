angular.module('voteApp').controller('retrieveVoteController',
['$scope', 'alertService', 'voteService', 'localStorageService',
function($scope, alertService, voteService, localStorageService) {
    $scope.voteHash = localStorageService.get('voteHash');

    $scope.retreiveVote =  function(voteHash) {
        voteService.retrieve(voteHash)
            .success(function(vote) {
                $scope.vote = vote;
            })
            .error(function(error) {
                switch (error.name) {
                    case 'NotFoundError':
                        alertService.addError('En stemme med denne kvitteringen ble ikke funnet.');
                        $scope.vote = null;
                        break;
                    default:
                        alertService.addError('Noe gikk galt, vennligst prøv igjen.');
                }
            });
    };
}]);
