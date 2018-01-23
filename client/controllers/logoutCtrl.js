module.exports = [
  '$scope',
  'localStorageService',
  'logoutService',
  function($scope, localStorageService, logoutService) {
    $scope.logout = function() {
      localStorageService.remove('voteHash');
      logoutService.logout();
    };
  }
];
