var bcrypt   = require('bcryptjs');
var SALT_ROUNDS = 8;

exports = module.exports = (collection, mongoose) => {
    var schema = mongoose.Schema({
        username: {
            type: String,
            required: true,
            index: true
        },
        password: {
            type: String,
            required: true
        }
    });

    schema.methods.generateHash = (password, cb) =>{
        bcrypt.hash(password, SALT_ROUNDS ,(err, hash)=>{
            return cb(err,hash);
        });
    };

    schema.methods.validPassword = (password, cb) =>{
        bcrypt.compare(password, (err, res)=>{
            return cb(err,res);
        });
    };

    return mongoose.model(collection, schema);
};