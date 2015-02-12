angular.module('voteApp').factory('voteService', ['$http', function($http) {
    return {
        vote: function(alternativeId) {
            return $http.post('/api/vote', { alternativeId: alternativeId });
        }
    };
}]);
