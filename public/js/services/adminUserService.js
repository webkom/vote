angular.module('voteApp').service('adminUserService', ['$http', function($http) {
    this.countActiveUsers = function() {
        return $http.get('/api/user/count?active=true');
    };
}]);
