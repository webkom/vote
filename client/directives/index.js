angular
  .module('voteApp')
  .directive('deactivateUsers', require('./confirmDeactivateDirective'))
  .directive('confirmVote', require('./confirmVoteDirective'))
  .directive('matchPassword', require('./passwordDirective'));
