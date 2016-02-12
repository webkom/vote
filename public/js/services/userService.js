angular.module('voteApp').service('userService', ['$http', function($http) {
    this.toggleUser = function(cardKey) {
        return $http.post('/api/user/' + cardKey + '/toggle_active');
    };

    this.createUser = function(user) {
        return $http.post('/api/user', user);
    };

    this.changeCard = function(user) {
        return $http.put('/api/user/' + user.username + '/change_card', user);
    };

    this.countActiveUsers = function() {
        return $http.get('/api/user/count?active=true');
    };

    this.deleteNonAdminUsers = function() {
        return $http.delete('/api/user');
    };
}]);
