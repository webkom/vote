angular.module('voteApp').controller('loginController', function($scope, apiService, alertService) {

    $scope.login = function() {
        apiService.login($scope.username, $scope.password)
            .success(function(data) {
                apiService.setUser(data);
                alertService.addSuccess('Du er nå logget inn');
            })
            .error(function(data, status) {
                alertService.addError('Innlogging mislykkes');
            });
    };
});
