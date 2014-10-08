exports = module.exports = (models) =>{
    return {
        locallogin : require('./local-login')(models.User)
    };
};