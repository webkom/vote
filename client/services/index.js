angular
  .module('voteApp')
  .factory('alertService', require('./alertService'))
  .factory('cardKeyService', require('./cardKeyService'))
  .factory('logoutService', require('./logoutService'))
  .factory('socketIOService', require('./socketIOService'))
  .factory('voteService', require('./voteService'))
  .service('adminElectionService', require('./adminElectionService'))
  .service('electionService', require('./electionService'))
  .service('userService', require('./userService'));
