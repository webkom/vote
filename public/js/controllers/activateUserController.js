angular.module('voteApp').controller('activateUserController', function($scope, apiService) {

    $scope.formFeedback = '';

    $scope.activateUser = function(cardKey) {
        apiService.activateUser(cardKey)
            .success(function(data) {
                if (data.active) {
                    $scope.formFeedback = 'Bruker har blitt aktivert';
                } else {
                    $scope.formFeedback = 'Bruker har blitt deaktivert';
                }
            })
            .error(function(data) {
                $scope.formFeedback = 'ops, noe gikk galt!';
            });
    };
});
