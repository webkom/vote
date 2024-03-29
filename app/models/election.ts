import _ from 'lodash';
import errors from '../errors';
import mongoose, {
  Schema,
  Types,
  type HydratedDocument,
  type HydratedDocumentFromSchema,
} from 'mongoose';
import Vote from './vote';
import calculateWinnerUsingNormal from '../algorithms/normal';
import calculateWinnerUsingSTV from '../algorithms/stv';
import crypto from 'crypto';
import { ElectionSystems } from '../types/types';
import type {
  AlternativeType,
  IElectionMethods,
  ElectionModel,
  ElectionType,
  UserType,
  PopulatedVote,
  AlternativeModel,
} from '../types/types';

const electionSchema = new Schema<
  ElectionType,
  ElectionModel,
  IElectionMethods
>({
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
  },
  hasVotedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  alternatives: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Alternative',
    },
  ],
  seats: {
    type: Number,
    default: 1,
    min: [1, 'An election should have at least one seat'],
  },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Vote',
    },
  ],
  type: {
    type: String,
    enum: [ElectionSystems.NORMAL, ElectionSystems.STV],
    default: ElectionSystems.NORMAL,
    validate: {
      validator: function (v: string) {
        return v === ElectionSystems.NORMAL && this.seats !== 1 ? false : true;
      },
      message: 'Normal elections must have exactly one seat',
    },
  },
  useStrict: {
    type: Boolean,
    default: false,
    validate: {
      validator: function (v: boolean) {
        return v && this.seats !== 1 ? false : true;
      },
      message: 'Strict elections must have exactly one seat',
    },
  },
  accessCode: {
    type: Number,
    // https://mongoosejs.com/docs/defaults.html#default-functions
    default: () => Math.floor(Math.random() * 9000 + 1000),
  },
  physical: {
    type: Boolean,
    default: true,
  },
});

electionSchema.pre<ElectionType>('remove', async function (next) {
  // Use mongoose.model getter to avoid circular dependencies
  const id = this._id;
  await mongoose
    .model<AlternativeModel>('Alternative')
    .find({ election: id })
    .then((alternatives) => {
      Promise.all(alternatives.map((alternative) => alternative.remove()));
    });
  next();
  await mongoose
    .model('Vote')
    .find({ election: id })
    .then((votes) => {
      Promise.all(votes.map((vote) => vote.remove()));
    });
  next();
});

electionSchema.methods.elect = async function (
  this: HydratedDocumentFromSchema<typeof electionSchema>
) {
  if (this.active) {
    throw new errors.ActiveElectionError(
      'Cannot retrieve results on an active election.'
    );
  }

  const populatedElection = await this.populate<{
    alternatives: AlternativeType[];
    votes: PopulatedVote[];
  }>([
    'alternatives',
    {
      path: 'votes',
      model: 'Vote',
      populate: {
        path: 'priorities',
        model: 'Alternative',
      },
    },
  ]);

  const cleanElection = this.toJSON<typeof populatedElection>();

  // Type of election decides algorithm
  if (cleanElection.type == ElectionSystems.NORMAL) {
    return calculateWinnerUsingNormal(
      cleanElection.votes,
      cleanElection.alternatives,
      cleanElection.seats,
      cleanElection.useStrict
    );
  } else if (cleanElection.type == ElectionSystems.STV) {
    return calculateWinnerUsingSTV(
      cleanElection.votes,
      cleanElection.alternatives,
      cleanElection.seats,
      cleanElection.useStrict
    );
  } else {
    throw new errors.InvalidElectionTypeError();
  }
};

electionSchema.methods.addAlternative = async function (
  alternative: HydratedDocument<AlternativeType>
) {
  alternative.election = this._id;
  const savedAlternative = await alternative.save();
  this.alternatives = [...this.alternatives, savedAlternative];
  await this.save();
  return savedAlternative;
};

electionSchema.methods.addVote = async function (
  user: UserType,
  priorities: AlternativeType[]
) {
  if (!user) throw new Error("Can't vote without a user");
  if (!user.active) throw new errors.InactiveUserError(user.username);
  if (user.admin) throw new errors.AdminVotingError();
  if (user.moderator) throw new errors.ModeratorVotingError();

  if (!this.active) {
    throw new errors.InactiveElectionError();
  }
  const votedUsers = this.hasVotedUsers;
  const hasVoted = _.find(votedUsers, { _id: user._id });

  if (hasVoted) {
    throw new errors.AlreadyVotedError();
  }

  // 24 character random string
  const voteHash = crypto.randomBytes(12).toString('hex');
  const vote = new Vote({
    hash: voteHash,
    election: this.id,
    priorities: priorities,
  });

  this.hasVotedUsers.push(new Types.ObjectId(user._id));
  await this.save();

  const savedVote = await vote.save();
  this.votes.push(savedVote._id);

  await this.save();

  return savedVote;
};

export default mongoose.model<ElectionType, ElectionModel>(
  'Election',
  electionSchema
);
