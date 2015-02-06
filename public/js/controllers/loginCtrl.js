angular.module('voteApp').controller('loginController', function($scope, apiService) {

    $scope.formFeedback = '';

    $scope.login = function() {
        apiService.login($scope.username, $scope.password)
            .success(function(data) {
                apiService.setUser(data);
                $scope.formFeedback = 'Du er nå logget inn';
            })
            .error(function(data, status) {
                $scope.formFeedback = 'Innlogging mislykkes';
            });
    };
});
