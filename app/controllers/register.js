const Register = require('../models/register');
const errors = require('../errors');

exports.list = (req, res) =>
  Register.find().then((register) => res.json(register));

exports.delete = async (req, res) => {
  const register = await Register.findOne({
    _id: req.params.registerId,
  }).exec();
  if (!register.user) {
    throw new errors.NoAssociatedUserError();
  }
  return register.remove().then(() =>
    res.status(200).json({
      message: 'Register and associated user deleted.',
      status: 200,
    })
  );
};
