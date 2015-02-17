angular.module('voteApp').service('electionService', ['$http', '$routeParams',
function($http, $routeParams) {

    this.getElections = function() {
        return $http.get('/api/election');
    };

    this.getElection = function() {
        return $http.get('/api/election/' + $routeParams.param);
    };
}]);
