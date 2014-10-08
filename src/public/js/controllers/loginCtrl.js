angular.module('loginCtrl', []).controller('loginController', ($scope, $http) => {

    $scope.login = () => {
        $http({method: 'POST', data: {username: $scope.username, password: $scope.password}, url: '/auth/login'}).
            success((data, status, headers, config) => {
                $scope.tagline = data;

            }).
            error((data, status, headers, config) => {
                $scope.tagline = "nope";
            });
    };
});