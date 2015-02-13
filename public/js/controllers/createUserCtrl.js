angular.module('voteApp').controller('createUserController', function($scope, apiService, alertService) {

    $scope.createUser = function(user) {
        apiService.createUser(user.cardKey, user.username, user.password)
            .success(function(data) {
                alertService.addSuccess('Bruker registrert!');
            })
            .error(function(data) {
                alertService.addError();
            });

    };

});
