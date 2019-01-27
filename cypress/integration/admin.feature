Feature: Admin
  Elections and users should be managed through the admin panel

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

  Scenario: Activating user
    Given There is an inactive user with card key "1234"
    And I am on page "/admin/activate_user"
    When I scan card key "1234"
    Then I see alert "Bruker har blitt aktivert."

  Scenario: Deactivating user
    Given There is an active user with card key "1234"
    And I am on page "/admin/activate_user"
    When I scan card key "1234"
    Then I see alert "Bruker har blitt deaktivert."

  Scenario: Activating users in series should only show one alert
    Given There is an inactive user with card key "1234"
    And There is an inactive user with card key "1235"
    And I am on page "/admin/activate_user"
    When I scan card key "1234"
    And I scan card key "1235"
    Then I see alert "Bruker har blitt aktivert."
    And I count 1 ".alert"

  Scenario: Activating user with invalid card key
    Given There is an active user with card key "1234"
    And I am on page "/admin/activate_user"
    When I scan card key "1235"
    Then I see alert "Uregistrert kort, vennligst lag en bruker først."

  Scenario: Creating user
    Given I am on page "/admin/create_user"
    When I scan card key "1234"
    And I fill in "username" with "newuser"
    And I fill in "password" with "password"
    And I submit the form
    Then I see alert "Bruker registrert!"

  Scenario: Creating user with an already existing card key
    Given I am on page "/admin/create_user"
    And There is an active user with card key "1234"
    When I scan card key "1234"
    And I fill in "username" with "newuser"
    And I fill in "password" with "password"
    And I submit the form
    Then I see alert "Dette kortet er allerede blitt registrert."

  Scenario: Creating user with an existing username
    Given I am on page "/admin/create_user"
    When I scan card key "1234"
    And I fill in "username" with "testuser"
    And I fill in "password" with "password"
    And I submit the form
    Then I see alert "Dette brukernavnet er allerede i bruk."

  Scenario: Count number of votes and active users
    Given There is an active election
    And The election has votes
    And I am on the edit election page
    Then I should see 1 in "votedUsers"
    And I should see 1 in "activeUsers"

  Scenario: Changing the card key of a user
    Given There is an active user with card key "1234"
    And I am on page "/admin/change_card"
    When I scan card key "1235"
    And I fill in "username" with "testuser"
    And I fill in "password" with "password"
    And I click "Registrer nytt kort"
    Then I see alert "Det nye kortet er nå registert."

  Scenario: Changing the card key of a user to an existing card
    Given There is an active user with card key "1234"
    And I am on page "/admin/change_card"
    When I scan card key "55TESTCARDKEY"
    And I fill in "username" with "testuser"
    And I fill in "password" with "password"
    And I click "Registrer nytt kort"
    Then I see alert "Dette kortet er allerede blitt registrert."

  Scenario: Changing the card key of a user with invalid credentials
    Given There is an active user with card key "1234"
    And I am on page "/admin/change_card"
    When I scan card key "1235"
    And I fill in "username" with "testuser"
    And I fill in "password" with "notpassword"
    And I click "Registrer nytt kort"
    Then I see alert "Ugyldig brukernavn og/eller passord."

  Scenario: Deactivating users
    Given I am on page "/admin/deactivate_users"
    When I click "Deaktiver brukere"
    And I click "Er du sikker?"
    Then I see alert "Alle brukere ble deaktivert!"
