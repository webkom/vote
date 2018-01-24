module.exports = [
  '$window',
  '$rootScope',
  function($window, $rootScope) {
    $rootScope.$on('$routeChangeStart', function() {
      angular.element($window).unbind('message');
    });

    return {
      listen: function(cb) {
        angular.element($window).bind('message', function(e) {
          cb(e.data);
        });
      }
    };
  }
];
