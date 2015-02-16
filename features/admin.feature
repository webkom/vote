Feature: Election
  ...

  Background:
    Given I am logged in as an admin

  Scenario: List elections
    When I am on page "/admin"
    Then I see a list of elections

  Scenario: Create election
    Given There is an inactive election
    And I am on page "/admin/create_election"
    And I create an election
    Then I should be on "\/admin\/election\/[\w]+\/edit"
    And The election should exist
