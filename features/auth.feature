Feature: Election
  Users should be able to log in and out

  Background:
    Given I am logged in as a moderator

  Scenario: Log in
    When I log in
    Then I should be on page "/"

  Scenario: Log out
    Given I am logged in
    When I log out
    Then I should be on page "/auth/login"
