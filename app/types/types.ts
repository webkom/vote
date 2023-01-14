import { Model, Types, HydratedDocument } from 'mongoose';
import { ElectionResult } from '../algorithms/types';

export enum ElectionSystems {
  NORMAL = 'normal',
  STV = 'stv',
}

export enum Status {
  resolved = 'RESOLVED',
  unresolved = 'UNRESOLVED',
}

export type Count = { [key: string]: number };

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
  ): Promise<HydratedDocument<AlternativeType>>;
  addVote(
    user: UserType,
    priorities: AlternativeType[]
  ): Promise<HydratedDocument<VoteType>>;
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
  getCleanUser(): Omit<UserType, 'password' | 'hash'>;
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
  priorities: Types.ObjectId[];
}
export type VoteType = IVote;

export interface PopulatedVote extends Omit<IVote, 'priorities'> {
  priorities: IAlternative[];
}

export interface PopulatedElection
  extends Omit<IElection, 'votes' | 'alternatives'> {
  votes: PopulatedVote[];
  alternatives: IAlternative[];
}
