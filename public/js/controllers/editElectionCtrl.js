angular.module('voteApp').controller('editElectionController',
['$scope', '$interval', 'electionService', 'adminElectionService', 'alertService',
function($scope, $interval, electionService, adminElectionService, alertService) {

    $scope.newAlternative = {};
    $scope.election = null;
    $scope.showCount = false;

    var countInterval;

    electionService.getElection()
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
                    alertService.addSuccess('Avstemning er deaktivert');
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
            .error(function(error) {
                $interval.cancel(countInterval);
                alertService.addError(error.message);
            });
    }

    $scope.toggleCount = function() {
        $scope.showCount = !$scope.showCount;
        if ($scope.showCount) {
            getCount();
            countInterval = $interval(getCount, 3000);
        } else {
            if (countInterval) {
                $interval.cancel(countInterval);
            }
        }
    };
}]);
