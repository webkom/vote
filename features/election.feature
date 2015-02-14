Feature: Election
  ...

  Background:
    Given I am logged in

  Scenario: Find election
    Given There is an active election
    And I am on page "/election"
    Then I see an active election

  Scenario: Hide election after vote
    Given There is an active election
    And I have voted on the election
    And I am on page "/election"
    Then I see "Ingen aktive avstemninger."

  Scenario: Hide inactive election
    Given There is an inactive election
    And I am on page "/election"
    Then I see "Ingen aktive avstemninger."
