module.exports = function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      selectedAlternative: '=',
      voteHandler: '&'
    },
    template:
      '' +
      '<button type="button" ng-click="click()" ' +
      'ng-disabled="!selectedAlternative" class="btn btn-lg btn-default">' +
      '{{buttonText || "Velg et alternativ"}}' +
      '</button>',

    link: function(scope, elem, attrs) {
      var clicked = false;

      scope.$watch('selectedAlternative', function(newValue) {
        if (newValue) {
          scope.buttonText = 'Avgi stemme';
          clicked = false;
        }
      });

      scope.click = function() {
        if (!clicked) {
          clicked = true;
          scope.buttonText = 'Er du sikker?';
        } else {
          scope.voteHandler();
        }
      };
    }
  };
};
