module.exports = (app, express) => {
    require('./api')(app, express);
    require('./app')(app, express);
};