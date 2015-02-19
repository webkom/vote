angular.module('voteApp').factory('logoutService',
['$http', '$window', function($http, $window) {
    return {
        logout: function() {
            $http.post('/auth/logout')
                .success(function() {
                    $window.location.href = '/';
                });
        }
    };
}]);
