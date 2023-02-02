angular
  .module('voteApp')
  .directive('deactivateUsers', require('./confirmDeactivateDirective'))
  .directive('matchPassword', require('./passwordDirective'))
  .directive('sortable', require('./sortableDirective'));
