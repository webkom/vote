module.exports = [
  '$interval',
  '$rootScope',
  function ($interval, $rootScope) {
    $rootScope.alerts = [];

    var CLOSE_DELAY = 500;
    var FADE_DELAY = 5000;

    var AlertService = {
      add: function (type, large, message) {
        var alert = {
          type: type,
          message: message,
          large,
          close: function () {
            AlertService.close(this);
          },
        };

        $rootScope.alerts.push(alert);

        this.timeoutRemove(alert);
      },

      addError: function (message, large = false) {
        var errMessage = message || 'Noe gikk galt!';
        this.add('danger', large, errMessage);
      },

      addWarning: function (message, large = false) {
        var warnMessage = message || 'Noe gikk galt.';
        this.add('warning', large, warnMessage);
      },

      addSuccess: function (message, large = false) {
        var succMessage = message || 'Ferdig!';
        this.add('success', large, succMessage);
      },

      close: function (alert) {
        var foundAlert = $rootScope.alerts.indexOf(alert);

        if (foundAlert !== -1) {
          $rootScope.alerts.splice(foundAlert, 1);
        }
      },

      closeAll: function () {
        $rootScope.alerts.splice(0, $rootScope.alerts.length);
      },

      getLastAlert: function () {
        var index = $rootScope.alerts.length - 1;
        if (index >= 0) {
          return $rootScope.alerts[index];
        }
      },

      timeoutRemove: function (alert) {
        // Use $interval to let protractor skip waiting for alerts to fade
        $interval(
          function () {
            alert.fade = true;

            $interval(
              function () {
                this.close(alert);
              }.bind(this),
              CLOSE_DELAY,
              1
            );
          }.bind(this),
          FADE_DELAY,
          1
        );
      },
    };

    return AlertService;
  },
];
