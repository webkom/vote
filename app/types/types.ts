import { Model, Document } from "mongoose";
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
    winners: AlternativeType[];
}

export interface NormalResult extends STVResult {
    status: Status;
    winners: AlternativeType[];
    count: number;
}

interface IAlternative {
    _id: string;
    description: string;
    election: ElectionType;
}
export type AlternativeType = IAlternative & Document;

interface IElection {
    _id: string;
    title: string;
    description: string;
    active: boolean;
    hasVotedUsers: UserType[];
    alternatives: AlternativeType[];
    seats: number;
    votes: VoteType[];
    type: string;
    useStrict: boolean;
    accessCode: number;

    // methods
    elect() : ElectionResult;
    addAlternative(alternative: AlternativeType) : AlternativeType;
    addVote(user: UserType, priorities: AlternativeType[]) : AlternativeType;
}
export type ElectionType = IElection & Document;

interface IRegister {
    _id: string;
    identifier: string;
    email: string;
    user: UserType;
}
export type RegisterType = IRegister & Document;

interface IUser extends Document {
    _id: string;
    username: string;
    hash: string;
    active: boolean;
    admin: boolean;
    moderator: boolean;
    cardKey: string;

    // methods
    getCleanUser() : UserType;
    authenticate(password : string) : Promise<boolean>;
}
export type UserType = IUser & Document;

export interface UserModel extends Model<UserType> {
    // statics
    authenticate(username : string, password : string) : Promise<IUser>;
    findByUsername(username : string) : Promise<IUser>;
    register(body : IUser, password : string) : Promise<IUser>;
}

interface IVote extends Document {
    _id: string;
    hash: string;
    election: ElectionType;
}
export type VoteType = IVote & Document;
