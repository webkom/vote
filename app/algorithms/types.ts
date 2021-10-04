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

export type Result = {
  thr: number;
  voteCount: number;
  blankVoteCount: number;
  useStrict: boolean;
};
