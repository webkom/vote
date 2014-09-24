module.exports = (app, express) => {

    app.get('/*', (res, req) => {
        console.log('This is frontend');
    });
};