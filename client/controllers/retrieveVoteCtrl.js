module.exports = [
  '$scope',
  'alertService',
  'voteService',
  'localStorageService',
  function($scope, alertService, voteService, localStorageService) {
    $scope.voteHash = localStorageService.get('voteHash');

    $scope.retrieveVote = function(voteHash) {
      voteService
        .retrieve(voteHash)
        .then(function(response) {
          $scope.vote = response.data;
        }, function(response) {
          switch (response.data.name) {
            case 'NotFoundError':
              alertService.addError(
                'En stemme med denne kvitteringen ble ikke funnet.'
              );
              $scope.vote = null;
              break;
            default:
              alertService.addError();
          }
        });
    };
  }
];
