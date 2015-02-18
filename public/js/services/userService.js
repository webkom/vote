angular.module('voteApp').service('userService', ['$http', function($http) {

    this.toggleUser = function(cardKey) {
        return $http.post('/api/user/' + cardKey + '/toggle_active');
    };

    this.createUser = function(user) {
        return $http.post('/api/user', user);
    };

}]);
