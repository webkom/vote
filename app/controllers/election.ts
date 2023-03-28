import type { RequestParamHandler, RequestHandler } from 'express';
import mongoose, { type HydratedDocument, Types } from 'mongoose';
import Election from '../models/election';
import User from '../models/user';
import Alternative from '../models/alternative';
import errors from '../errors';
import app from '../../app';
import type { Server } from 'socket.io';
import type {
  ElectionType,
  AlternativeType,
  IElectionMethods,
} from '../types/types';

type CreateElection = Pick<
  ElectionType,
  'title' | 'description' | 'seats' | 'type' | 'useStrict' | 'physical'
> & {
  alternatives: {
    description: AlternativeType['description'];
    election?: Types.ObjectId;
  }[];
};

export const load: RequestParamHandler = (req, res, next, electionId) =>
  Election.findById(electionId)
    .then((election) => {
      if (!election) throw new errors.NotFoundError('election');
      req.election = election;
      next();
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        throw new errors.NotFoundError('election');
      }
      throw err;
    });

export const retrieveActive: RequestHandler = (req, res) =>
  Election.findOne({
    active: true,
    hasVotedUsers: { $ne: new Types.ObjectId(req.user._id) },
  })
    .select('-hasVotedUsers')
    .populate('alternatives')
    .exec()
    .then(async (election) => {
      const { user, query } = req;
      // There is no active election (that the user has not voted on)
      if (!election) {
        throw new errors.NotFoundError('election');
      }

      // User is active, return the election
      if (user.active) {
        return res.status(200).json(election);
      }

      // Require the user to be active if the election is physical.
      if (election.physical) {
        throw new errors.InactiveUserError(user.username);
      }

      // Active election but wrong or not access code submitted,
      // so we return 403 which prompts a access code input field.
      if (
        !query.accessCode ||
        election.accessCode !== Number(query.accessCode)
      ) {
        throw new errors.AccessCodeError();
      }

      // Active election and the inactive user has the correct access code.
      // Therefore we activate the users account, and return the elction.
      await User.findByIdAndUpdate({ _id: user._id }, { active: true });
      return res.status(200).json(election);
    });

export const create: RequestHandler<
  unknown,
  ElectionType,
  CreateElection
> = async (req, res) => {
  try {
    const election = await Election.create({
      title: req.body.title,
      description: req.body.description,
      seats: req.body.seats,
      type: req.body.type,
      useStrict: req.body.useStrict,
      physical: req.body.physical,
    });

    const alternatives = req.body.alternatives;
    if (alternatives && alternatives.length) {
      await Promise.all(
        alternatives.map((a) => {
          return Alternative.create({ ...a, election: election });
        })
      ).then(async (createdAlternatives) => {
        election.alternatives = createdAlternatives.map((a) => a.id);
        await election.save();
      });
    }

    await election.populate('alternatives');
    return res.status(201).json(election);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw new errors.ValidationError(err.errors);
    }
  }
};

export const list: RequestHandler<unknown, ElectionType[]> = (req, res) =>
  Election.find()
    .populate('alternatives')
    .exec()
    .then((elections) => res.status(200).json(elections));

export const retrieve: RequestHandler<unknown, ElectionType> = async (
  req,
  res
) => {
  if (!req.election) throw new errors.NotFoundError('election');

  await req.election.populate('alternatives');

  return res.status(200).json(req.election);
};

const setElectionStatus = (
  election: HydratedDocument<ElectionType, IElectionMethods>,
  active: boolean
) => {
  election.active = active;
  return election.save();
};

export const activate: RequestHandler = async (req, res) => {
  if (!req.election) throw new errors.NotFoundError('election');

  const otherActiveElection = await Election.findOne({ active: true });
  if (otherActiveElection) {
    throw new errors.AlreadyActiveElectionError();
  }
  return setElectionStatus(req.election, true).then((election) => {
    const io: Server = app.get('io');
    io.emit('election');
    return res.status(200).json(election);
  });
};

export const deactivate: RequestHandler = (req, res) => {
  if (!req.election) throw new errors.NotFoundError('election');

  return setElectionStatus(req.election, false).then((election) => {
    const io: Server = app.get('io');
    io.emit('election');
    res.status(200).json(election);
  });
};

export const elect: RequestHandler = (req, res) => {
  if (!req.election) throw new errors.NotFoundError('election');

  return req.election.elect().then((result) => res.json(result));
};

export const deleteElection: RequestHandler = (req, res) => {
  if (!req.election) throw new errors.NotFoundError('election');

  if (req.election.active) {
    throw new errors.ActiveElectionError('Cannot delete an active election.');
  }

  return req.election.remove().then(() =>
    res.status(200).json({
      message: 'Election deleted.',
      status: 200,
    })
  );
};

export const count: RequestHandler = (req, res) => {
  if (!req.election) throw new errors.NotFoundError('election');

  res.json({
    users: req.election.hasVotedUsers.length,
  });
};

export default {
  load,
  retrieveActive,
  create,
  list,
  retrieve,
  activate,
  deactivate,
  elect,
  deleteElection,
  count,
};
