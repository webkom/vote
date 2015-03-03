angular.module('voteApp').controller('logoutController',
['$scope', 'localStorageService', 'logoutService',
function($scope, localStorageService, logoutService) {
    $scope.logout = function() {
        localStorageService.remove('voteHash');
        logoutService.logout();
    };
}]);
