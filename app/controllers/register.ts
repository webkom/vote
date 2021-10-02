import Register from '../models/register';
const ObjectId = require('mongoose').Types.ObjectId;
import errors from '../errors';

export const list = (req, res) =>
  Register.find().then((register) => res.json(register));

export const deleteEntry = async (req, res) => {
  if (!ObjectId.isValid(req.params.registerId)) {
    throw new errors.ValidationError('Invalid ObjectID');
  }

  const register = await Register.findOne({
    _id: req.params.registerId,
  });

  if (!register) {
    throw new errors.NotFoundError('register');
  }

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
