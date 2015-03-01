var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(chaiAsPromised);

function logIn(username, password, callback) {
    var driver = browser.driver;

    var findByName = function(name) {
        return driver.findElement(by.name(name));
    };

    driver.get('http://localhost:3000/auth/login');
    findByName('username').sendKeys(username);
    findByName('password').sendKeys(password);
    driver.findElement(by.tagName('button')).click();
    browser.waitForAngular().then(callback);
}

module.exports = function() {
    this.Given(/^I am logged in as an admin$/, function(callback) {
        logIn('admin', 'password', callback);
    });

    this.When(/^I log in$/, function(callback) {
        logIn('testUser', 'password', callback);
    });

    this.When(/^I log out/, function(callback) {
        var logoutButton = element(by.linkText('Logg ut'));
        logoutButton.click();
        callback();
    });

    this.Given(/^I am logged in$/, function(callback) {
        logIn('testUser', 'password', callback);
    });

    this.Given(/^I am on page "([^"]*)"$/, function(path, callback) {
        browser.get(path);
        callback();
    });

    this.Given(/^I am waiting on page "([^"]*)"$/, function(path, callback) {
        browser.get(path);
        browser.waitForAngular().then(callback);
    });

    this.When(/^I go to page "([^"]*)"$/, function(path, callback) {
        browser.get(path);
        callback();
    });

    this.Then(/^I should be on page "([^"]*)"$/, function(path, callback) {
        // Use the driver since it might be a page without angular
        var driver = browser.driver;
        expect(driver.getCurrentUrl()).to.eventually.contain(path).notify(callback);
    });

    this.Then(/^I see "([^"]*)"$/, function(text, callback) {
        expect(browser.getPageSource()).to.eventually.contain(text).notify(callback);
    });

    this.When(/^I click "([^"]*)"$/, function(buttonText, callback) {
        var button = element(by.buttonText(buttonText));
        button.click();
        callback();
    });

    this.Then(/^I should find "([^"]*)"$/, function(selector, callback) {
        expect(element(by.css(selector)).isPresent()).to.eventually.equal(true).notify(callback);
    });

    this.Then(/^I should not find "([^"]*)"$/, function(selector, callback) {
        expect(element(by.css(selector)).isPresent()).to.eventually.equal(false).notify(callback);
    });

    this.Then(/^I see alert "([^"]*)"$/, function(text, callback) {
        var alert = element(by.cssContainingText('.alert', text));
        browser.wait(function() {
            return alert.isPresent();
        }, 1000).then(function(isPresent) {
            expect(isPresent).to.equal(true);
            expect(alert.getText()).to.eventually.contain(text).notify(callback);
        });
    });

    this.When(/^I fill in "([^"]*)" with "([^"]*)"$/, function(id, value, callback) {
        element(by.id(id)).sendKeys(value);
        callback();
    });
};
