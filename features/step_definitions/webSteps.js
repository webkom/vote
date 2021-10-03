const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;

chai.use(chaiAsPromised);

by.addLocator('labelText', (labelText, opt_parentElement, opt_rootSelector) => {
  const using = opt_parentElement || document;
  const labels = using.querySelectorAll('label');
  return Array.prototype.filter.call(
    labels,
    (l) => l.textContent === labelText
  );
});

function logIn(username, password) {
  const driver = browser.driver;

  driver.get('http://localhost:3000/auth/login');
  const findByName = (name) => driver.findElement(by.name(name));
  findByName('username').sendKeys(username);
  findByName('password').sendKeys(password);
  driver.findElement(by.tagName('button')).click();
}

module.exports = function () {
  this.Given(/^I am logged in as an admin$/, () => {
    logIn('admin', 'password');
    this.userType = 'admin';
  });

  this.Given(/^I am logged in as a moderator$/, () => {
    logIn('moderator', 'password');
    this.userType = 'moderator';
  });

  this.When(/^I log in$/, () => {
    logIn('testUser', 'password');
    this.userType = 'user';
  });

  this.When(/^I log out/, () => {
    const logoutButton = element(by.linkText('Logg ut'));
    logoutButton.click();
    this.userType = undefined;
  });

  this.Given(/^I am logged in$/, () => {
    logIn('testUser', 'password');
  });

  this.Given(/^I am on page "([^"]*)"$/, (path) => {
    const actualPath =
      this.userType === 'moderator' ? path + '?dummyReader' : path;
    browser.get(actualPath);
  });

  this.When(/^I go to page "([^"]*)"$/, (path) => {
    browser.get(path);
  });

  this.Then(/^I should be on page "([^"]*)"$/, (path, callback) => {
    // Use the driver since it might be a page without angular
    const driver = browser.driver;
    expect(driver.getCurrentUrl()).to.eventually.contain(path).notify(callback);
  });

  this.Then(/^I see "([^"]*)"$/, (text) =>
    expect(browser.getPageSource()).to.eventually.contain(text)
  );

  this.When(/^I click "([^"]*)"$/, (buttonText) => {
    const button = element(by.buttonText(buttonText));
    button.click();
  });

  this.When(/^I click anchor "([^"]*)"$/, (classname) => {
    const anchor = element(by.className(classname));
    anchor.click();
  });

  this.Then(/^I should find "([^"]*)"$/, (selector) =>
    expect(element(by.css(selector)).isPresent()).to.eventually.equal(true)
  );

  this.Then(/^I should not find "([^"]*)"$/, (selector) =>
    expect(element(by.css(selector)).isPresent()).to.eventually.equal(false)
  );

  this.Then(/^I see alert "([^"]*)"$/, (text) => {
    const alert = element(by.cssContainingText('.alert', text));
    return alert.isPresent().then((isPresent) => {
      expect(isPresent).to.equal(true);
      return expect(alert.getText()).to.eventually.contain(text);
    });
  });

  this.When(/^I select option "([^"]*)/, (text) => {
    element(by.labelText(text)).click();
  });

  this.When(/^I fill in "([^"]*)" with "([^"]*)"$/, (name, value) => {
    element(by.name(name)).sendKeys(value);
  });

  this.Then(/^I see "([^"]*)" in "([^"]*)"$/, (value, className) => {
    const field = element(by.css(className));
    expect(field.getText()).to.eventually.equal(value);
  });

  this.Then(/^I count (\d+) "([^"]*)"$/, (count, css) => {
    const found = element.all(by.css(css));
    expect(found.count()).to.eventually.equal(Number(count));
  });

  this.Then(
    /^Button "([^"]*)" should( not)? be disabled$/,
    (buttonText, not) => {
      const button = element(by.buttonText(buttonText));
      expect(button.isEnabled()).to.eventually.equal(!!not);
    }
  );
};
