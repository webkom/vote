Feature: Admin
  Elections should be managed through the admin panel

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
    And The election is deactivated
    And I am on the edit election page
    When I click "Vis resultat"
    Then I should see votes

  Scenario: Count votes for active elections
    Given There is an active election
    When I am on the edit election page
    Then I should not find "button.toggle-show"

  Scenario: Add alternatives
    Given There is an inactive election
    And I am on the edit election page
    When I enter a new alternative "Alternative"
    And I click "Legg til alternativ"
    Then I should see the alternative "Alternative"

  Scenario: Adding alternatives to active elections
    Given There is an active election
    When I am on the edit election page
    Then I should not find "input#new-alternative"
    And I should not find "button.add-alternative"

  Scenario: Activating elections
    Given There is an inactive election
    And I am on the edit election page
    When I click "Aktiver"
    Then I see "Deaktiver"
    And I should not find "input#new-alternative"
    And I should not find "button.add-alternative"

  Scenario: Deactivating elections
    Given There is an active election
    And I am on the edit election page
    When I click "Deaktiver"
    Then I see "Aktiver"
    And I should find "input#new-alternative"
    And I should find "button.add-alternative"

  Scenario: Count number of votes and active users
    Given There is an active election
    And The election has votes
    And I am on the edit election page
    Then I should see 1 in "votedUsers"
    And I should see 1 in "activeUsers"
