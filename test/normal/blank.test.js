const dataset = require('./datasets');
const { prepareElection } = require('../helpers');

describe('Normal Blank Logic', () => {
  it('should not resolve for the election in dataset 1', async function () {
    const election = await prepareElection(dataset.dataset1);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 58,
      seats: 1,
      voteCount: 115,
      blankVoteCount: 15,
      useStrict: false,
      result: {
        status: 'UNRESOLVED',
        winners: undefined,
      },
      log: {
        Andrea: 45,
        Carter: 25,
        Brad: 30,
        blank: 15,
      },
    });
  });

  it('should resolve for the election in dataset 2', async function () {
    const election = await prepareElection(dataset.dataset2);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 78,
      seats: 1,
      voteCount: 155,
      blankVoteCount: 30,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Lisa', count: 80 }],
      },
      log: {
        Lisa: 80,
        Bob: 45,
        blank: 30,
      },
    });
  });

  it('should return the number of blank votes on 0 blank votes', async function () {
    const election = await prepareElection(dataset.dataset3);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 18,
      seats: 1,
      voteCount: 35,
      blankVoteCount: 0,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Nei', count: 25 }],
      },
      log: {
        Ja: 10,
        Nei: 25,
        blank: 0,
      },
    });
  });
});
