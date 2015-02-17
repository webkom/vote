angular.module('voteApp').factory('cardKeyService', ['$window', function($window) {
    return {
        listen: function(cb) {
            angular.element($window).bind('message', function(e) {
                cb(e.data);
            });
        }
    };
}]);
