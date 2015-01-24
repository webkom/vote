angular.module('voteApp').controller('loginController', function ($scope, apiService) {

    $scope.tagline = "asd";

    $scope.login = function () {
        apiService.login($scope.username, $scope.password).then(function (response) {
            $scope.tagline = response.data;
        });
    }
});