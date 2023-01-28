import { describe, test } from 'vitest';
import dataset from './datasets';
import { prepareElection } from '../helpers';
import app from '../app';

describe('STV Blank Logic', () => {
  test('should not resolve for the election in dataset 11 with blank votes', async function () {
    const election = await prepareElection(dataset.dataset11);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 13,
      seats: 1,
      voteCount: 24,
      blankVoteCount: 7,
      useStrict: false,
      result: {
        status: 'UNRESOLVED',
        winners: [],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            A: 10,
            B: 7,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'B' },
          minScore: 7,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [],
          counts: {
            A: 10,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'A' },
          minScore: 10,
        },
      ],
    });
  });

  test('should resolve with expected leader election (with blank votes)', async function () {
    const election = await prepareElection(dataset.dataset12);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 77,
      seats: 1,
      voteCount: 153,
      blankVoteCount: 11,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'B' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            A: 70,
            B: 72,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'A' },
          minScore: 70,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [],
          counts: {
            B: 119,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'B' },
          voteCount: 119,
        },
      ],
    });
  });

  test('should not resolve for a strict election with blank votes', async function () {
    const election = await prepareElection(dataset.dataset13);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 104,
      seats: 1,
      voteCount: 155,
      blankVoteCount: 23,
      useStrict: true,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Fjerne' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            Fjerne: 93,
            Bytte: 39,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Bytte' },
          minScore: 39,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [],
          counts: {
            Fjerne: 104,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'Fjerne' },
          voteCount: 104,
        },
      ],
    });
  });
});
