angular.module('loginCtrl', []).controller('loginController', ($scope, $http) => {

    $scope.tagline = "hmm";

    $scope.login = () => {
        $http({method: 'POST', data: {username: $scope.username, password: $scope.password}, url: '/api/auth/login'}).
            success((data, status, headers, config) => {
                $scope.tagline = "success";

            }).
            error((data, status, headers, config) => {
                $scope.tagline = "nope";
            });
    };
});