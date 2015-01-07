angular.module('voteApp').controller('loginController', ($scope, apiService) => {

    $scope.login = () => {
        apiService.login($scope.username, $scope.password).then(function (response) {
            $scope.tagline = response.data;
        });
    }
});