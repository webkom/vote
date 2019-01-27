import { Given } from "cypress-cucumber-preprocessor/steps";

const logIn = (username, password) => {
  cy.visit('/auth/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button').click();
}

Given(/^I am logged in as an admin$/, () => {
    logIn('admin', 'password');
});

Given(/^I am on page "([^"]*)"$/, path => {
    cy.visit(path);
});

Then(/^I see "([^"]*)"$/, text =>
    cy.contains(text)
);


/*const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { defineSupportCode } = require('cucumber');
const expect = chai.expect;

chai.use(chaiAsPromised);

function logInOld(username, password) {
  const driver = browser.driver;

  driver.get('http://localhost:3000/auth/login');
  const findByName = name => driver.findElement(by.name(name));
  findByName('username').sendKeys(username);
  findByName('password').sendKeys(password);
  driver.findElement(by.tagName('button')).click();
}

function logIn(username, password) {
  browser.waitForAngularEnabled(false);
  browser.get('http://localhost:3000/auth/login');

  element(by.name('username')).sendKeys(username);
  element(by.name('password')).sendKeys(password);
  element(by.tagName('button')).click();
  browser.waitForAngularEnabled(true);

  //const elm = element(by.tagName('button'));
  //const EC = protractor.ExpectedConditions;
  //browser.wait(EC.elementToBeClickable(elm), 5000);
  //elm.click();


  //driver.sleep(1000);
  //browser.waitForAngular();
}

defineSupportCode(({ Given, When, Then }) => {
  Given(/^I am logged in as an admin$/, () => {
    logIn('admin', 'password');
  });

  When(/^I log in$/, () => {
    logIn('testUser', 'password');
  });

  When(/^I log out/, () => {
    const logoutButton = element(by.linkText('Logg ut'));
    logoutButton.click();
  });

  Given(/^I am logged in$/, () => {
    logIn('testUser', 'password');
  });

  Given(/^I am on page "([^"]*)"$/, path => {
    browser.get(path);
  });

  When(/^I go to page "([^"]*)"$/, path => {
    browser.get(path);
  });

  Then(/^I should be on page "([^"]*)"$/, (path, callback) => {
    // Use the driver since it might be a page without angular
    const driver = browser.driver;
    expect(driver.getCurrentUrl())
      .to.eventually.contain(path)
      .notify(callback);
  });

  Then(/^I see "([^"]*)"$/, text =>
    expect(browser.getPageSource()).to.eventually.contain(text)
  );

  When(/^I click "([^"]*)"$/, buttonText => {
    const button = element(by.buttonText(buttonText));
    button.click();
  });

  Then(/^I should find "([^"]*)"$/, selector =>
    expect(element(by.css(selector)).isPresent()).to.eventually.equal(true)
  );

  Then(/^I should not find "([^"]*)"$/, selector =>
    expect(element(by.css(selector)).isPresent()).to.eventually.equal(false)
  );

  Then(/^I see alert "([^"]*)"$/, text => {
    const alert = element(by.cssContainingText('.alert', text));
    return alert.isPresent().then(isPresent => {
      expect(isPresent).to.equal(true);
      return expect(alert.getText()).to.eventually.contain(text);
    });
  });

  When(/^I fill in "([^"]*)" with "([^"]*)"$/, (name, value) => {
    element(by.name(name)).sendKeys(value);
  });

  Then(/^I see "([^"]*)" in "([^"]*)"$/, (value, className) => {
    const field = element(by.className(className));
    expect(field.getText()).to.eventually.equal(value);
  });

  Then(/^I count (\d+) "([^"]*)"$/, (count, css) => {
    const found = element.all(by.css(css));
    expect(found.count()).to.eventually.equal(Number(count));
  });
});
*/
