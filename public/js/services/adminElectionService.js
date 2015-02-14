angular.module('voteApp').service('adminElectionService', ['$http', '$routeParams',
function($http, $routeParams) {

    this.createElection = function(election) {
        return $http({ method: 'POST', data: election, url: '/api/election/' });
    };

    this.addAlternative = function(alternative) {
        return $http({ method: 'POST', data: alternative, url: '/api/election/' + $routeParams.param + '/alternatives' });
    };

    this.activateElection = function() {
        return $http({ method: 'POST', url: '/api/election/' + $routeParams.param + '/activate' });
    };

    this.deactivateElection = function() {
        return $http({ method: 'POST', url: '/api/election/' + $routeParams.param + '/deactivate' });
    };

}]);
