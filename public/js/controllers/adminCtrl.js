angular.module('voteApp').controller('adminController', function ($scope, $window, apiService) {

    if (apiService.isAuthenticated()) {
        apiService.getElections().then(function (response) {
            $scope.elections = response.data;
        });
    } else {
        $window.location.href = '/';
    }
});
