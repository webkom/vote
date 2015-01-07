angular.module('voteApp').controller('adminController', function($scope, $http, $window, adminService) {

    if (adminService.isAuthenticated()) {
        adminService.getElections().then(function(response) {
            $scope.elections = response.data;
        });
        console.log($scope.elections);
    } else {
        $window.location.href = "/";
    }
});