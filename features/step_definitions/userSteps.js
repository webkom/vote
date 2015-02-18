var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

module.exports = function() {

    this.Given(/^There is an (in)?active user with card key "([^"]*)"$/, function(active, cardKey, callback) {
        this.user.active = active !== 'in';
        this.user.cardKey = cardKey;
        this.user.save(callback);
    });
};
