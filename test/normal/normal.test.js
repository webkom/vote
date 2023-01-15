import dataset from './datasets';
import { prepareElection } from '../helpers';

describe('Normal Logic', () => {
  it('should resolve for the election in dataset 4', async function () {
    const election = await prepareElection(dataset.dataset4);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 73,
      seats: 1,
      voteCount: 144,
      blankVoteCount: 12,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Ja', count: 87 }],
      },
      log: {
        Ja: 87,
        Nei: 45,
        blank: 12,
      },
    });
  });

  it('should resolve for the close election in dataset 5', async function () {
    const election = await prepareElection(dataset.dataset5);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 67,
      seats: 1,
      voteCount: 133,
      blankVoteCount: 10,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Ja', count: 67 }],
      },
      log: {
        Ja: 67,
        Nei: 56,
        blank: 10,
      },
    });
  });

  it('should not resolve for the close election in dataset 6', async function () {
    const election = await prepareElection(dataset.dataset6);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 66,
      seats: 1,
      voteCount: 130,
      blankVoteCount: 12,
      useStrict: false,
      result: {
        status: 'UNRESOLVED',
        winners: undefined,
      },
      log: {
        Ja: 65,
        Nei: 53,
        blank: 12,
      },
    });
  });
});
