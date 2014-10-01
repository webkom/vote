exports = module.exports = (User) => {
    return (req, username, password, done) =>{
        User.findOne({ 'username' :  username },(err, user)=>{
            if (err) return done(err);
            if (!user) return done(null, false, req.flash('loginMessage', 'User not found.'));
            if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            return done(null, user, req.flash('loginMessage', 'Welcome via local sign-in!'));
        });
    };
};