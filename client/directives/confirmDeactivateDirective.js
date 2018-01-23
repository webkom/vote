module.exports = function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      deactivateHandler: '&',
      buttonText: '@'
    },
    template:
      '' +
      '<button type="button" ng-click="click()" class="btn btn-lg btn-default">' +
      '{{buttonText || "Deaktiver brukere"}}' +
      '</button>',
    link: function(scope, elem, attrs) {
      var clicked = false;

      var originalText = scope.buttonText;

      scope.click = function() {
        if (!clicked) {
          clicked = true;
          scope.buttonText = 'Er du sikker?';
        } else {
          scope.deactivateHandler();
          clicked = false;
          scope.buttonText = originalText;
        }
      };
    }
  };
};
