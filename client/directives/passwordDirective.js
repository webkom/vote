module.exports = function() {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      matchPassword: '='
    },
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(
        function() {
          return ctrl.$pristine || scope.matchPassword === ctrl.$modelValue;
        },
        function(currentValue) {
          ctrl.$setValidity('matchPassword', currentValue);
        }
      );
    }
  };
};
