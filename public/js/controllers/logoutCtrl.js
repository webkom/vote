angular.module('voteApp').controller('logoutController',
['$scope', 'logoutService', function($scope, logoutService) {
    $scope.logout = function() {
        logoutService.logout();
    };
}]);
