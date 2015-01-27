
angular.module('voteApp').controller('mainController', function($scope, apiService) {

    $scope.tagline = 'Main';

    $scope.authenticated = false;

    apiService.isAuthenticated().then(function (response) {
        $scope.authenticated = (response.data.isAuthenticated === 'sdftest');
    });

});