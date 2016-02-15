var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(chaiAsPromised);

function logIn(username, password) {
    var driver = browser.driver;

    driver.get('http://localhost:3000/auth/login');
    var findByName = name => driver.findElement(by.name(name));
    findByName('username').sendKeys(username);
    findByName('password').sendKeys(password);
    driver.findElement(by.tagName('button')).click();
}

module.exports = function() {
    this.Given(/^I am logged in as an admin$/, function() {
        logIn('admin', 'password');
    });

    this.When(/^I log in$/, function() {
        logIn('testUser', 'password');
    });

    this.When(/^I log out/, function() {
        var logoutButton = element(by.linkText('Logg ut'));
        logoutButton.click();
    });

    this.Given(/^I am logged in$/, function() {
        logIn('testUser', 'password');
    });

    this.Given(/^I am on page "([^"]*)"$/, function(path) {
        browser.get(path);
    });

    this.When(/^I go to page "([^"]*)"$/, function(path) {
        browser.get(path);
    });

    this.Then(/^I should be on page "([^"]*)"$/, function(path, callback) {
        // Use the driver since it might be a page without angular
        var driver = browser.driver;
        expect(driver.getCurrentUrl()).to.eventually.contain(path).notify(callback);
    });

    this.Then(/^I see "([^"]*)"$/, function(text) {
        return expect(browser.getPageSource()).to.eventually.contain(text);
    });

    this.When(/^I click "([^"]*)"$/, function(buttonText) {
        var button = element(by.buttonText(buttonText));
        button.click();
    });

    this.Then(/^I should find "([^"]*)"$/, function(selector) {
        return expect(element(by.css(selector)).isPresent()).to.eventually.equal(true);
    });

    this.Then(/^I should not find "([^"]*)"$/, function(selector) {
        return expect(element(by.css(selector)).isPresent()).to.eventually.equal(false);
    });

    this.Then(/^I see alert "([^"]*)"$/, function(text) {
        var alert = element(by.cssContainingText('.alert', text));
        return alert.isPresent()
            .then(isPresent => {
                expect(isPresent).to.equal(true);
                return expect(alert.getText()).to.eventually.contain(text);
            });
    });

    this.When(/^I fill in "([^"]*)" with "([^"]*)"$/, function(name, value) {
        element(by.name(name)).sendKeys(value);
    });

    this.Then(/^I see "([^"]*)" in "([^"]*)"$/, function(value, className) {
        var field = element(by.className(className));
        expect(field.getText()).to.eventually.equal(value);
    });

    this.Then(/^I count (\d+) "([^"]*)"$/, function(count, css) {
        var found = element.all(by.css(css));
        expect(found.count()).to.eventually.equal(Number(count));
    });
};
