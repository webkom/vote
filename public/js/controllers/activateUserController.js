angular.module('voteApp').controller('activateUserController', function($scope, apiService, alertService) {

    $scope.activateUser = function(cardKey) {
        apiService.activateUser(cardKey)
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
});
