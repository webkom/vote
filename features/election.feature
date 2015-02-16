Feature: Election
  ...

  Background:
    Given I am logged in

  Scenario: Find election
    Given There is an active election
    When I go to page "/election"
    Then I see an active election

  Scenario: Hide election after vote
    Given There is an active election
    And I have voted on the election
    When I go to page "/election"
    Then I see "Ingen aktive avstemninger."

  Scenario: Hide inactive election
    Given There is an inactive election
    When I go to page "/election"
    Then I see "Ingen aktive avstemninger."
