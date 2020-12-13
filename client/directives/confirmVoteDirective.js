module.exports = function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      selectedAlternatives: '=',
      voteHandler: '&',
    },
    template:
      '' +
      '<button type="button" ng-click="click()" ' +
      'ng-disabled="selectedAlternatives.length === 0" class="btn btn-lg btn-default">' +
      '{{buttonText || "Velg noen alternativer"}}' +
      '</button>',

    link: function (scope, elem, attrs) {
      var clicked = false;

      scope.$watch('selectedAlternatives', function (newValue) {
        if (newValue.length > 0) {
          scope.buttonText = 'Avgi stemme';
          clicked = false;
        }
      });

      scope.click = function () {
        if (!clicked) {
          clicked = true;
          scope.buttonText = 'Er du sikker?';
        } else {
          scope.voteHandler();
        }
      };
    },
  };
};
