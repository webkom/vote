angular.module('voteApp').controller('loginController', function($scope, apiService) {

    $scope.formFeedback = '';

    $scope.login = function() {
        apiService.login($scope.username, $scope.password).then(function(response) {
            if (response.data.user) {
                apiService.setUser(response.data.user);
            }
            $scope.tagline = response.data;
        });
    };
});
