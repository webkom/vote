var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

function logIn(username, password) {
    var driver = browser.driver;

    var findByName = function(name) {
        return driver.findElement(by.name(name));
    };

    driver.get('http://localhost:3000/auth/login');
    findByName('username').sendKeys(username);
    findByName('password').sendKeys(password);
    driver.findElement(by.tagName('button')).click();
}

module.exports = function() {
    this.Given(/^I am logged in as an admin$/, function(callback) {
        logIn('admin', 'password');
        callback();
    });

    this.Given(/^I am logged in$/, function(callback) {
        logIn('testUser', 'password');
        callback();
    });

    this.Given(/^I am on page "([^"]*)"$/, function(path, callback) {
        browser.get(path);
        callback();
    });

    this.Then(/^I see "([^"]*)"$/, function(text, callback) {
        expect(browser.getPageSource()).to.eventually.contain(text).notify(callback);
    });

};
