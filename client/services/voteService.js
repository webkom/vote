module.exports = [
  '$http',
  function($http) {
    return {
      vote: function(alternativeId) {
        return $http.post('/api/vote', { alternativeId: alternativeId });
      },
      retrieve: function(voteHash) {
        return $http.get('/api/vote', { headers: { 'Vote-Hash': voteHash } });
      }
    };
  }
];
