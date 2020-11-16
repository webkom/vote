module.exports = [
  '$scope',
  'adminElectionService',
  function ($scope, adminElectionService) {
    adminElectionService.getElections().then(function (response) {
      $scope.elections = response.data;
    });
  },
];
