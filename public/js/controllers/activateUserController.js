angular.module('voteApp').controller('activateUserController',
['$scope', 'userService', 'alertService', 'cardKeyService', function($scope, userService, alertService, cardKeyService) {

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

    cardKeyService.listen(function(cardKey) {
        if (!$scope.user) $scope.user = {};
        $scope.user.cardKey = cardKey;
        $scope.$apply();
    });

}]);
