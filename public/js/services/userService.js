angular.module('voteApp').service('userService', ['$http', function($http) {

    this.activateUser = function(cardKey) {
        return $http({ method: 'POST', url: '/api/user/' + cardKey + '/toggle_active' });
    };

    this.createUser = function(user) {
        return $http({ method: 'POST', data: user, url: '/api/user' });
    };

}]);
