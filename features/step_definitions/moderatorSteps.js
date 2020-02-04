module.exports = function() {
  this.When(/^I scan card key "([^"]*)"$/, cardKey => {
    browser.executeScript(`window.postMessage("${cardKey}", "*");`);
  });

  this.When(/^I delete users$/, () => {
    const button = element(by.css('button'));

    button.click();
    button.click();
  });
};
