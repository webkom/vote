angular.module('voteApp').directive('deleteUsers', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            deleteHandler: '&',
            buttonText: '@'
        },
        template: '' +
            '<button type="button" ng-click="click()" class="btn btn-lg btn-default">' +
            '{{buttonText}}' +
            '</button>',
        link: function(scope, elem, attrs) {
            var clicked = false;

            var originalText = scope.buttonText;

            scope.click = function() {
                if (!clicked) {
                    clicked = true;
                    scope.buttonText = 'Er du sikker?';
                } else {
                    scope.deleteHandler();
                    clicked = false;
                    scope.buttonText = originalText;
                }
            };
        }
    };
});
