import { describe, test } from 'vitest';
import dataset from './datasets';
import { prepareElection } from '../helpers';

describe('Strict Logic', () => {
  test('should not resolve for the strict election in dataset 7', async function () {
    const election = await prepareElection(dataset.dataset7);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 122,
      seats: 1,
      voteCount: 182,
      blankVoteCount: 17,
      useStrict: true,
      result: {
        status: 'UNRESOLVED',
        winners: undefined,
      },
      log: {
        Ja: 117,
        Nei: 48,
        blank: 17,
      },
    });
  });

  test('should resolve for the strict election in dataset 8', async function () {
    const election = await prepareElection(dataset.dataset8);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 116,
      seats: 1,
      voteCount: 173,
      blankVoteCount: 10,
      useStrict: true,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Ny Struktur', count: 123 }],
      },
      log: {
        'Ny Struktur': 123,
        'Gammel Struktur': 40,
        blank: 10,
      },
    });
  });

  test('should not resolve for the clone strict election in dataset 9', async function () {
    const election = await prepareElection(dataset.dataset9);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 101,
      seats: 1,
      voteCount: 150,
      blankVoteCount: 10,
      useStrict: true,
      result: {
        status: 'UNRESOLVED',
        winners: undefined,
      },
      log: {
        Utvalg: 100,
        'Ikke Utvalg': 40,
        blank: 10,
      },
    });
  });
});
