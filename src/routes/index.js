module.exports = (app, express) => {
    require('./api')(app, express);
    require('./auth')(app, express);
    require('./app')(app, express);
};