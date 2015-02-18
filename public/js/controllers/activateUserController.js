angular.module('voteApp').controller('activateUserController',
['$scope', 'userService', 'alertService', 'cardKeyService', function($scope, userService, alertService, cardKeyService) {

    var toggleUser = function(cardKey) {
        userService.toggleUser(cardKey)
            .success(function(data) {
                if (data.active) {
                    alertService.addSuccess('Bruker har blitt aktivert.');
                } else {
                    alertService.addWarning('Bruker har blitt deaktivert.');
                }
            })
            .error(function(data) {
                alertService.addError();
            });
    };

    cardKeyService.listen(toggleUser);

}]);
