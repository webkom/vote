angular.module('voteApp').controller('createUserController', function($scope, apiService) {

    $scope.formFeedback = '';

    $scope.createUser = function(user) {
        apiService.createUser(user.cardkey, user.username, user.password)
            .success(function(data) {
                $scope.formFeedback = 'Bruker registrert!';
            })
            .error(function(data) {
                $scope.formFeedback = 'Ops, noe gikk galt';
            });

    };

});
