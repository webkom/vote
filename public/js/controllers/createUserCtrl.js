angular.module('voteApp').controller('createUserController',
['$scope', 'userService', 'alertService', 'cardKeyService', function($scope, userService, alertService, cardKeyService) {

    $scope.user = {};

    $scope.createUser = function(user) {
        userService.createUser(user)
            .success(function(data) {
                alertService.addSuccess('Bruker registrert!');
            })
            .error(function(data) {
                alertService.addError();
            });
    };

    cardKeyService.listen(function(cardKey) {
        $scope.user.cardKey = cardKey;
        $scope.$apply();
    });

}]);
