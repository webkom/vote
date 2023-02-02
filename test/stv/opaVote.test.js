import { describe, test } from 'vitest';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import dataset from './datasets';
import { prepareElection } from '../helpers';

chai.use(chaiSubset);

describe('STV OpaVote', () => {
  test('should calculate the result correctly for the OpaVote dataset', async function () {
    const election = await prepareElection(dataset.datasetOpaVote);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 3750,
      seats: 2,
      voteCount: 11248,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Steve' }, { description: 'Bill' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            Steve: 2146,
            Elon: 1926,
            Bill: 2219,
            Warren: 1757,
            Richard: 1586,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Richard' },
          minScore: 1586,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [],
          counts: {
            Steve: 2590,
            Elon: 2243,
            Bill: 2551,
            Warren: 2125,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Warren' },
          minScore: 2125,
        },
        {
          action: 'ITERATION',
          iteration: 3,
          winners: [],
          counts: {
            Steve: 3152,
            Elon: 2735,
            Bill: 3342,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Elon' },
          minScore: 2735,
        },
        {
          action: 'ITERATION',
          iteration: 4,
          winners: [],
          counts: {
            Steve: 4259,
            Bill: 4502,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'Steve' },
          voteCount: 4259,
        },
        {
          action: 'WIN',
          alternative: { description: 'Bill' },
          voteCount: 4502,
        },
      ],
    });
  }, 30000);
});
