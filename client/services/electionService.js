module.exports = [
  '$http',
  '$routeParams',
  function($http, $routeParams) {
    this.getActiveElection = function() {
      return $http.get('/api/election/active');
    };
  }
];
