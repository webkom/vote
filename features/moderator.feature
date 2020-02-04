Feature: Moderator
  Users should be managed through the moderator panel

  Background:
    Given I am logged in as a moderator

  Scenario: Activating user
    Given There is an inactive user with card key "1234"
    And I am on page "/moderator/activate_user"
    When I scan card key "1234"
    Then I see alert "Bruker har blitt aktivert."

  Scenario: Deactivating user
    Given There is an active user with card key "1234"
    And I am on page "/moderator/activate_user"
    When I scan card key "1234"
    Then I see alert "Bruker har blitt deaktivert."

  Scenario: Activating users in series should only show one alert
    Given There is an inactive user with card key "1234"
    And There is an inactive user with card key "1235"
    And I am on page "/moderator/activate_user"
    When I scan card key "1234"
    And I scan card key "1235"
    Then I see alert "Bruker har blitt aktivert."

  Scenario: Activating user with invalid card key
    Given There is an active user with card key "1234"
    And I am on page "/moderator/activate_user"
    When I scan card key "1235"
    Then I see alert "Uregistrert kort, vennligst lag en bruker først."

  Scenario: Creating user
    Given I am on page "/moderator/create_user"
    When I scan card key "1234"
    And I fill in "username" with "newuser"
    And I fill in "password" with "password"
    And I submit the form
    Then I see alert "Bruker registrert!"

  Scenario: Creating user with an already existing card key
    Given I am on page "/moderator/create_user"
    And There is an active user with card key "1234"
    When I scan card key "1234"
    And I fill in "username" with "newuser"
    And I fill in "password" with "password"
    And I submit the form
    Then I see alert "Dette kortet er allerede blitt registrert."

  Scenario: Creating user with an existing username
    Given I am on page "/moderator/create_user"
    When I scan card key "1234"
    And I fill in "username" with "testuser"
    And I fill in "password" with "password"
    And I submit the form
    Then I see alert "Dette brukernavnet er allerede i bruk."

  Scenario: Changing the card key of a user
    Given There is an active user with card key "1234"
    And I am on page "/moderator/change_card"
    When I scan card key "1235"
    And I fill in "username" with "testuser"
    And I fill in "password" with "password"
    And I click "Registrer nytt kort"
    Then I see alert "Det nye kortet er nå registert."

  Scenario: Changing the card key of a user to an existing card
    Given There is an active user with card key "1234"
    And I am on page "/moderator/change_card"
    When I scan card key "55TESTCARDKEY"
    And I fill in "username" with "testuser"
    And I fill in "password" with "password"
    And I click "Registrer nytt kort"
    Then I see alert "Dette kortet er allerede blitt registrert."

  Scenario: Changing the card key of a user with invalid credentials
    Given There is an active user with card key "1234"
    And I am on page "/moderator/change_card"
    When I scan card key "1235"
    And I fill in "username" with "testuser"
    And I fill in "password" with "notpassword"
    And I click "Registrer nytt kort"
    Then I see alert "Ugyldig brukernavn og/eller passord."

  Scenario: Deactivating users
    Given I am on page "/moderator/deactivate_users"
    When I click "Deaktiver brukere"
    And I click "Er du sikker?"
    Then I see alert "Alle brukere ble deaktivert!"
