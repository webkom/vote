angular.module('voteApp').service('userService', ['$http', function($http) {

    this.activateUser = function(cardKey) {
        return $http.post('/api/user/' + cardKey + '/toggle_active', cardKey);
    }

    this.createUser = function(user) {
        return $http.post('/api/user', user);
    };

}]);
