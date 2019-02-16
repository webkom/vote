Feature: Moderator tasks
  Elections and users should be managed through the admin panel

  Background:
    Given I am logged in as a moderator

  Scenario: Creating user
    Given I am on page "/moderator/create_user"
    When I scan card key "1234"
    And I fill in "username" with "newuser"
    And I fill in "password" with "password"
    And I submit the form
    Then I see alert "Bruker registrert!"

  Scenario: Creating user via qr
    Given I am on page "/moderator/qr"
    When I scan card key "1234"
    Then I should be on page "/moderator/showqr"

  Scenario: Creating user via qr and closes
    Given I am on page "/moderator/qr"
    When I scan card key "1234"
    When I click "Lukk"
    Then I should be on page "/moderator/qr"
    And I see alert "Bruker har blitt registrert"

  Scenario: Creating user via qr and clicks close and deactivate
    Given I am on page "/moderator/qr"
    When I scan card key "1234"
    When I click "Lukk og deaktiver bruker"
    Then I should be on page "/moderator/qr"
    And I see alert "Bruker har blitt laget og deaktivert. Du må derfor bruke et nytt kort"
