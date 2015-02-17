angular.module('voteApp').factory('alertService', ['$interval', '$rootScope',
function($interval, $rootScope) {

    $rootScope.alerts = [];

    var CLOSE_DELAY = 500;
    var FADE_DELAY = 10000;

    var AlertService = {
        add: function(type, message) {
            var alert = {
                type: type,
                message: message,
                close: function() {
                    AlertService.close(this);
                }
            };

            $rootScope.alerts.push(alert);

            this.timeoutRemove(alert);
        },

        addError: function(message) {
            if (!message) message = 'Noe gikk galt!';
            this.add('danger', message);
        },

        addSuccess: function(message) {
            if (!message) message = 'Ferdig!';
            this.add('success', message);
        },

        close: function(alert) {
            $rootScope.alerts.splice($rootScope.alerts.indexOf(alert), 1);
        },

        timeoutRemove: function(alert) {
            // Use $interval to let protractor skip waiting for alerts to fade
            $interval(function() {
                alert.fade = true;

                $interval(function() {
                    this.close(alert);
                }.bind(this), CLOSE_DELAY, 1);
            }.bind(this), FADE_DELAY, 1);
        }
    };

    return AlertService;
}]);
