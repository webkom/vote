module.exports = [
  '$http',
  function ($http) {
    this.getActiveElection = function (accessCode) {
      return $http.get(`/api/election/active?accessCode=${accessCode}`);
    };
  },
];
