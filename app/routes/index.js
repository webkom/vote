module.exports = function (app, express, models) {
    require('./api')(app, express, models);
    require('./auth')(app, express);
    require('./app')(app, express);
};