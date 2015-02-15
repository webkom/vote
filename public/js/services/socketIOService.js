angular.module('voteApp').factory('socketIOService', function() {
    var socket = io();

    return {
        listen: function(message, callback) {
            socket.on(message, callback);
        }
    };
});
