angular.module('voteApp').service('electionService', ['$http', '$routeParams',
function($http, $routeParams) {

    this.getElections = function() {
        return $http({ method: 'GET', url: '/api/election' });
    };

    this.getElection = function() {
        return $http({ method: 'GET', url: '/api/election/' + $routeParams.param });
    };
}]);
