module.exports = [
  '$http',
  function ($http) {
    this.getRegisterEntries = function () {
      return $http.get('/api/register');
    };

    this.deleteRegisterEntry = function (register) {
      return $http.delete(`/api/register/${register}`);
    };
  },
];
