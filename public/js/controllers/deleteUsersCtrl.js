angular.module('voteApp').controller('deleteUsersController',
    ['$scope', '$route', 'userService', 'alertService', function($scope, $route, userService, alertService) {

    $scope.deleteNonAdminUsers = function() {
        userService.deleteNonAdminUsers()
            .success(function(data) {
                alertService.addSuccess('Alle brukere ble slettet!');
            })
            .error(function(data) {
                alertService.addError();
            });
        $route.reload();
    };
}]);
