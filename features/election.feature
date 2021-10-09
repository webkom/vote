Feature: Election
  Elections should only be shown if active
  Elections should be hidden after voting

  Background:
    Given I am logged in

  Scenario: Find election
    Given There is an active "stv" election
    When I go to page "/"
    Then I see an active election

  Scenario: Hide election after vote (STV)
    Given There is an active "stv" election
    And I have voted on the election
    When I go to page "/"
    Then I see "Ingen aktive avstemninger."

  Scenario: Voting on one alternative (STV)
    Given There is an active "stv" election
    When I vote on an election
    Then I see alert "Takk for din stemme!"

  Scenario: Voting on a NORMAL election
    Given There is an active "normal" election
    When I select "test alternative"
    Then Button "Avgi stemme" should not be disabled
    When I deselect "test alternative"
    Then Button "Stem blank" should not be disabled
    When I select "another test alternative"
    When I submit the vote
    Then I have 1 alternative on the confirmation ballot
    And I see "another test alternative" as priority 1 on the confirmation ballot
    When I confirm the vote
    Then I see "Takk for din stemme!"

  Scenario: Prioritizing alternatives
    Given There is an active "stv" election
    When I select "another test alternative"
    And I select "test alternative"
    Then I see "another test alternative" as priority 1
    And I see "test alternative" as priority 2
    When I submit the vote
    Then I see "test alternative" as priority 2 on the confirmation ballot
    And I see "another test alternative" as priority 1 on the confirmation ballot
    When I confirm the vote
    Then I see alert "Takk for din stemme!"

  Scenario: Voting blank
    Given There is an active "stv" election
    When I click "Stem blank"
    Then I see "Blank stemme" in ".ballot h3"
    When I confirm the vote
    Then I see alert "Takk for din stemme!"
    Given I am on page "/retrieve"
    When I submit the form
    Then I see "Blank stemme" in ".ballot h3"

  Scenario: Retrieve vote from localStorage
    Given There is an active "stv" election
    When I vote on an election
    Given I am on page "/retrieve"
    Then I see my hash in "voteHash"
    When I submit the form
    Then I see "Din prioritering på: activeElectionSTV" in ".vote-result-feedback h3"
    And I see "test alternative" as priority 1 on the receipt

  Scenario: Retrieve vote with invalid hash
    Given There is an active "normal" election
    And I am on page "/retrieve"
    And I fill in "voteHash" with "invalidhash"
    When I submit the form
    Then I see alert "En stemme med denne kvitteringen ble ikke funnet."

  Scenario: Hide inactive election
    Given There is an inactive election
    When I go to page "/"
    Then I see "Ingen aktive avstemninger."

  Scenario: Show alert to inactive users
    Given There is an active "normal" election
    And There is an inactive user with card key "1234"
    When I vote on an election
    Then I see alert "Brukeren din er deaktivert, vennligst henvend deg til skranken."
