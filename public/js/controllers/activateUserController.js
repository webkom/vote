angular.module('voteApp').controller('activateUserController',
['$scope', 'userService', 'alertService', function($scope, userService, alertService) {

    $scope.activateUser = function(cardKey) {
        userService.activateUser(cardKey)
            .success(function(data) {
                if (data.active) {
                    alertService.addSuccess('Bruker har blitt aktivert');
                } else {
                    alertService.addSuccess('Bruker har blitt deaktivert');
                }
            })
            .error(function(data) {
                alertService.addError();
            });
    };
}]);
