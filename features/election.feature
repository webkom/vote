Feature: Election
  Elections should only be shown if active
  Elections should be hidden after voting

  Background:
    Given I am logged in

  Scenario: Find election
    Given There is an active election
    When I go to page "/"
    Then I see an active election

  Scenario: Hide election after vote
    Given There is an active election
    And I have voted on the election
    When I go to page "/"
    Then I see "Ingen aktive avstemninger."

  Scenario: Voting
    Given There is an active election
    When I vote on an election
    Then I see alert "Takk for din stemme!"

  Scenario: Retrieve vote with valid hash
    Given There is an active election
    And I have voted on the election
    And I am on the retrieve vote page
    When I submit the form
    Then I see "Kvittering:"
    Then I see "Avstemning:"
    Then I see "Alternativ valgt:"

  Scenario: Retrieve vote with invalid hash
    Given There is an active election
    And I am on the retrieve vote page
    And I enter a random string as vote hash
    When I submit the form
    Then I see alert "En stemme med denne kvitteringen ble ikke funnet."

  Scenario: Hide inactive election
    Given There is an inactive election
    When I go to page "/"
    Then I see "Ingen aktive avstemninger."

  Scenario: Show alert to inactive users
    Given There is an active election
    And There is an inactive user with card key "1234"
    When I vote on an election
    Then I see alert "Brukeren din er deaktivert, vennligst henvend deg til skranken."
