angular.module('voteApp').controller('editElectionController',
['$scope', '$interval', 'adminUserService', 'adminElectionService', 'alertService',
function($scope, $interval, adminUserService, adminElectionService, alertService) {

    $scope.newAlternative = {};
    $scope.election = null;
    $scope.showCount = false;

    var countInterval;

    adminElectionService.getElection()
        .success(function(data) {
            $scope.election = data;
        });

    $scope.addAlternative = function(alternative) {
        adminElectionService.addAlternative(alternative)
            .success(function(data) {
                $scope.election.alternatives.push(data);
                alertService.addSuccess('Alternativ lagret');
            })
            .error(function(error) {
                alertService.addError(error.message);
            });
    };

    $scope.toggleElection = function() {
        if ($scope.election.active) {
            adminElectionService.deactivateElection()
                .success(function(data) {
                    $scope.election.active = data.active;
                    alertService.addWarning('Avstemning er deaktivert');
                })
                .error(function(error) {
                    alertService.addError(error.message);
                });
        } else {
            adminElectionService.activateElection()
                .success(function(data) {
                    $scope.election.active = data.active;
                    alertService.addSuccess('Avstemning er aktivert');
                })
                .error(function(error) {
                    alertService.addError(error.message);
                });
        }
    };

    function handleIntervalError(error) {
        $interval.cancel(countInterval);
        alertService.addError(error.message);
    }

    function getCount() {
        adminElectionService.countVotes()
            .success(function(alternatives) {
                $scope.election.alternatives.forEach(function(alternative) {
                    alternatives.some(function(resultAlternative) {
                        if (resultAlternative.alternative === alternative._id) {
                            alternative.votes = resultAlternative.votes;
                            return true;
                        }
                    });
                });
            })
            .error(handleIntervalError);
    }

    function countActiveUsers() {
        adminUserService.countActiveUsers()
            .success(function(result) {
                $scope.activeUsers = result.users;
            })
            .error(handleIntervalError);
    }
    countActiveUsers();

    function countVotedUsers() {
        adminElectionService.countVotedUsers()
            .success(function(result) {
                $scope.votedUsers = result.users;
            })
            .error(handleIntervalError);
    }
    countVotedUsers();

    $scope.$on('$destroy', function() {
        if (countInterval) $interval.cancel(countInterval);
    });

    $scope.toggleCount = function() {
        $scope.showCount = !$scope.showCount;
        if ($scope.showCount) {
            getCount();
            countInterval = $interval(function() {
                getCount();
                countActiveUsers();
                countVotedUsers();
            }, 3000);
        } else {
            if (countInterval) {
                $interval.cancel(countInterval);
            }
        }
    };
}]);
