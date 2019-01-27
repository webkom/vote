Feature: Election
  Users should be able to log in and out

  Scenario: Log in
    When I log in
    Then I should be on page "/"

  Scenario: Log out
    Given I am logged in
    When I log out
    Then I should be on page "/auth/login"
