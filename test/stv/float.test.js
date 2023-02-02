import { describe, test } from 'vitest';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import dataset from './datasets';
import { prepareElection } from '../helpers';

chai.use(chaiSubset);

describe('STV Floating Point Logic', () => {
  test('should calculate floating points correctly for dataset5', async function () {
    const election = await prepareElection(dataset.dataset5);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 8,
      seats: 2,
      voteCount: 23,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'A' }, { description: 'B' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            A: 9,
            B: 7,
            C: 4,
            D: 3,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'A' },
          voteCount: 9,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [{ description: 'A' }],
          counts: {
            B: 7.3333,
            C: 4.3333,
            D: 3.3333,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'D' },
          minScore: 3.3333,
        },
        {
          action: 'ITERATION',
          iteration: 3,
          winners: [{ description: 'A' }],
          counts: {
            B: 7.6667,
            C: 4.3333,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'C' },
          minScore: 4.3333,
        },
        {
          action: 'ITERATION',
          iteration: 4,
          winners: [{ description: 'A' }],
          counts: {
            B: 8,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'B' },
          voteCount: 8,
        },
      ],
    });
  });

  test('should calculate floating points correctly for dataset6', async function () {
    const election = await prepareElection(dataset.dataset6);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 71,
      seats: 2,
      voteCount: 210,
      useStrict: false,
      result: {
        status: 'UNRESOLVED',
        winners: [{ description: 'A' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            A: 90,
            B: 40,
            C: 40,
            D: 40,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'A' },
          voteCount: 90,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [{ description: 'A' }],
          counts: {
            B: 46.3333,
            C: 46.3333,
            D: 40,
            E: 3.5889,
            F: 2.7444,
          },
        },
        {
          action: 'TIE',
          description:
            'There are 2 candidates with a score of 0 at iteration 2',
        },
        {
          action: 'TIE',
          description:
            'The backward checking went to iteration 1 without breaking the tie',
        },
        {
          action: 'MULTI_TIE_ELIMINATIONS',
          alternatives: [{ description: 'G' }, { description: 'H' }],
          minScore: 0,
        },
        {
          action: 'ITERATION',
          iteration: 3,
          winners: [{ description: 'A' }],
          counts: {
            B: 46.3333,
            C: 46.3333,
            D: 40,
            E: 3.5889,
            F: 2.7444,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'F' },
          minScore: 2.7444,
        },
        {
          action: 'ITERATION',
          iteration: 4,
          winners: [{ description: 'A' }],
          counts: {
            B: 46.3333,
            C: 46.3333,
            D: 42.7444,
            E: 3.5889,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'E' },
          minScore: 3.5889,
        },
        {
          action: 'ITERATION',
          iteration: 5,
          winners: [{ description: 'A' }],
          counts: {
            B: 46.3333,
            C: 46.3333,
            D: 46.3333,
          },
        },
        {
          action: 'TIE',
          description:
            'There are 3 candidates with a score of 46.3333 at iteration 5',
        },
        // Egde case iteration. See the dataset for explanation
        {
          action: 'ELIMINATE',
          alternative: { description: 'D' },
          minScore: 42.7444,
        },
        {
          action: 'ITERATION',
          iteration: 6,
          winners: [{ description: 'A' }],
          counts: {
            B: 46.3333,
            C: 46.3333,
          },
        },
        {
          action: 'TIE',
          description:
            'There are 2 candidates with a score of 46.3333 at iteration 6',
        },
        {
          action: 'TIE',
          description:
            'The backward checking went to iteration 1 without breaking the tie',
        },
        {
          action: 'MULTI_TIE_ELIMINATIONS',
          alternatives: [{ description: 'B' }, { description: 'C' }],
          minScore: 46.3333,
        },
        {
          action: 'ITERATION',
          iteration: 7,
          winners: [{ description: 'A' }],
          counts: {},
        },
      ],
    });
  });
});
