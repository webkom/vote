import { Model, Types, HydratedDocument } from 'mongoose';
import { STVEvent } from '../algorithms/stv';

export enum ElectionSystems {
  NORMAL = 'normal',
  STV = 'stv',
}

export enum Status {
  resolved = 'RESOLVED',
  unresolved = 'UNRESOLVED',
}

export type Count = { [key: string]: number };

export type ElectionResult = {
  result: STVResult | NormalResult;
  thr: number;
  seats: number;
  voteCount: number;
  blankVoteCount: number;
  useStrict: boolean;
  log: STVEvent[] | Count;
};

export interface STVResult {
  status: Status;
  winners: Types.ObjectId[];
}

export interface NormalResult extends STVResult {
  status: Status;
  winners: Types.ObjectId[];
  count: number;
}

export interface IAlternative {
  _id: string;
  description: string;
  election: Types.ObjectId;
}
export type AlternativeType = IAlternative;
export type AlternativeModel = Model<IAlternative>;

export interface IElection {
  _id: string;
  title: string;
  description: string;
  active: boolean;
  hasVotedUsers: Types.ObjectId[];
  alternatives: Types.ObjectId[];
  seats: number;
  votes: Types.ObjectId[];
  type: ElectionSystems;
  useStrict: boolean;
  accessCode: number;
  physical: boolean;
}

export interface IElectionMethods {
  elect(): Promise<ElectionResult | undefined>;
  addAlternative(
    alternative: HydratedDocument<AlternativeType>
  ): AlternativeType;
  addVote(user: UserType, priorities: AlternativeType[]): AlternativeType;
}

export type ElectionType = IElection;
export type ElectionModel = Model<
  IElection,
  Record<string, never>,
  IElectionMethods
>;

interface IRegister {
  _id: string;
  identifier: string;
  email: string;
  user: Types.ObjectId;
}
export type RegisterType = IRegister;

export interface IUser {
  _id: string;
  username: string;
  hash: string;
  active: boolean;
  admin: boolean;
  moderator: boolean;
  cardKey: string;
}

export interface IUserMethods {
  // methods
  getCleanUser(): UserType;
  authenticate(password: string): Promise<boolean>;
}
export type UserType = IUser;

export interface UserModel
  extends Model<UserType, Record<string, never>, IUserMethods> {
  // statics
  authenticate(
    username: string,
    password: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
  findByUsername(
    username: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
  register(
    body: IUser,
    password: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
}

interface IVote {
  _id: string;
  hash: string;
  election: Types.ObjectId;
}
export type VoteType = IVote;
