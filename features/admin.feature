Feature: Admin
  Elections should be managed through the admin panel

  Background:
    Given I am logged in as an admin

  Scenario: List elections
    When I am on page "/admin"
    Then I see a list of elections

  Scenario: Create basic election
    Given There is an inactive election
    And I am on page "/admin/create_election"
    When I create an election
    Then The election should exist
    And The election should have type "normal"
    And The election should have seats "1"

  Scenario: Create invalid election
    Given There is an inactive election
    And I am on page "/admin/create_election"
    When I fill in "title" with "test election"
    And I select option "Preferansevalg"
    And I fill in "seats" with "2"
    And I fill in "alternative0" with "A"
    Then Button "Submit" should be disabled

  Scenario: Correct fields for election types
    Given I am on page "/admin/create_election"
    Then I should not find "input[name='seats']"
    When I select option "Preferansevalg"
    Then I should find "input[name='seats']"

  Scenario: Create election with more seats
    Given There is an inactive election
    And I am on page "/admin/create_election"
    When I fill in "title" with "test election"
    And I select option "Preferansevalg"
    And I fill in "seats" with "2"
    And I fill in "alternative0" with "A"
    And I click anchor "new-alternative"
    And I fill in "alternative1" with "B"
    Then Button "Submit" should not be disabled
    When I click "Submit"
    Then I see alert "Avstemning lagret"
    And The election "test election" should have type "stv"
    And The election "test election" should have seats "2"

  Scenario: Count votes for STV election
    Given There is an active "stv" election
    And The election has "seats" 2
    And There are 2 users
    And The election has 2 votes
    And The election is deactivated
    And I am on the edit election page
    When I click "Kalkuler resultat"
    Then I should see the stv log
    And I should see 2 in "election.voteCount"
    And I should see 0 in "election.blankVoteCount"
    And I should see 2 in "election.seats"
    And There should be 2 winners
    And I should see "test alternative" as winner 1
    And I should see "another test alternative" as winner 2

  Scenario: Count votes for NORMAL election
    Given There is an active "normal" election
    And The election has votes
    And The election is deactivated
    And I am on the edit election page
    When I click "Kalkuler resultat"
    Then I should see 1 in "election.voteCount"
    And I should see 0 in "election.blankVoteCount"
    And I should see 1 in "election.seats"
    And There should be 1 winner
    And I should see "test alternative" as winner 1

  Scenario: Count votes for active elections
    Given There is an active "stv" election
    When I am on the edit election page
    Then I should not find "button.toggle-show"

  Scenario: Add alternatives
    Given There is an inactive election
    And I am on the edit election page
    When I enter a new alternative "Alternative"
    And I click "Legg til alternativ"
    Then I should see the alternative "Alternative"

  Scenario: Adding alternatives to active elections
    Given There is an active "stv" election
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
    Given There is an active "stv" election
    And I am on the edit election page
    When I click "Deaktiver"
    Then I see "Aktiver"
    And I should find "input#new-alternative"
    And I should find "button.add-alternative"

  Scenario: Count number of votes and active users
    Given There is an active "stv" election
    And The election has votes
    And I am on the edit election page
    Then I should see 1 in "votedUsers"
    And I should see 1 in "activeUsers"
