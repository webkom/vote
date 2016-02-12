angular.module('voteApp').controller('deleteUsersController',
    ['$scope', 'userService', 'alertService', function($scope, userService, alertService) {
        $scope.deleteNonAdminUsers = function() {
            userService.deleteNonAdminUsers()
            .success(function(data) {
                alertService.addSuccess('Alle brukere ble slettet!');
            })
            .error(function(data) {
                alertService.addError();
            });
        };
    }]);
