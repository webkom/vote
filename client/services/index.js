angular.module('voteApp')
.service('adminElectionService', require('./adminElectionService'))
.factory('alertService', require('./alertService'))
.factory('cardKeyService', require('./cardKeyService'))
.service('electionService', require('./electionService'))
.factory('logoutService', require('./logoutService'))
.factory('socketIOService', require('./socketIOService'))
.service('userService', require('./userService'))
.factory('voteService', require('./voteService'));
