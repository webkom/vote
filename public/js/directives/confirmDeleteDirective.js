angular.module('voteApp').directive('deleteUsers', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            deleteHandler: '&'
        },
        template: '' +
            '<button type="button" ng-click="click()" class="btn btn-lg btn-default">' +
            '{{buttonText || "Slett brukere"}}' +
            '</button>',
        link: function(scope, elem, attrs) {
            var clicked = false;

            scope.click = function() {
                if (!clicked) {
                    clicked = true;
                    scope.buttonText = 'Er du sikker?';
                }
                else {
                    scope.deleteHandler();
                }
            };
        }
    };
});