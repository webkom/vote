import { Count } from './normal';
import { STVEvent } from './stv';

export type Alternative = {
  _id: string;
  description: string;
  election: string;
};

export type Vote = {
  _id: string;
  priorities: Alternative[];
  hash: string;
  weight?: number;
};

export enum Status {
  resolved = 'RESOLVED',
  unresolved = 'UNRESOLVED',
}

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
  winners: Alternative[];
}

export interface NormalResult extends STVResult {
  status: Status;
  winners: Alternative[];
  count: number;
}
