module.exports = [
  '$http',
  function ($http) {
    return {
      vote: function (election, priorities) {
        return $http.post('/api/vote', { election, priorities });
      },
      retrieve: function (voteHash) {
        return $http.get('/api/vote', { headers: { 'Vote-Hash': voteHash } });
      },
    };
  },
];
