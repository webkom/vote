angular.module('voteApp').controller('createUserController',
['$scope', 'userService', 'alertService', function($scope, userService, alertService) {

    $scope.createUser = function(user) {
        userService.createUser(user)
            .success(function(data) {
                alertService.addSuccess('Bruker registrert!');
            })
            .error(function(data) {
                alertService.addError();
            });
    };

}]);
