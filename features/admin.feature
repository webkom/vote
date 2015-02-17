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
    When I create an election
    Then The election should exist

  Scenario: Count votes
    Given There is an active election
    And The election has votes
    And I am on the edit election page
    When I click "Vis resultat"
    Then I should see votes

  Scenario: Add alternatives
    Given There is an inactive election
    And I am on the edit election page
    When I enter a new alternative "Alternative"
    And I click "Legg til alternativ"
    Then I should see the alternative "Alternative"

  Scenario: Adding alternatives to active elections
    Given There is an active election
    When I am on the edit election page
    Then I should not see "input#new-alternative"
    And I should not see "button.add-alternative"
