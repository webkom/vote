module.exports = [
  '$http',
  '$window',
  function ($http, $window) {
    return {
      logout: function () {
        $http.post('/auth/logout').then(function () {
          $window.location.href = '/';
        });
      },
    };
  },
];
