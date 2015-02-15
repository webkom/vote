var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

module.exports = function() {
    this.Given(/^I am logged in$/, function(callback) {
        var driver = browser.driver;

        var findByName = function(name) {
            return driver.findElement(by.name(name));
        };

        driver.get('http://localhost:3000/auth/login');
        findByName('username').sendKeys('testUser');
        findByName('password').sendKeys('password');
        driver.findElement(by.tagName('button')).click();

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
