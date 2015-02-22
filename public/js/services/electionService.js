angular.module('voteApp').service('electionService', ['$http', '$routeParams',
function($http, $routeParams) {
    this.getActiveElection = function() {
        return $http.get('/api/election/active');
    };
}]);
