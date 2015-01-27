
angular.module('voteApp').controller('mainController', function($scope, apiService) {

    $scope.authenticated = apiService.user.admin;

});