import { Given } from "cypress-cucumber-preprocessor/steps";

Given(/^There is an (in)?active user with card key "([^"]*)"$/, (active, cardKey) => {
    this.user.active = active !== 'in';
    this.user.cardKey = cardKey;
    return this.user.save();
});
