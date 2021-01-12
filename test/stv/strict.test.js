const chai = require('chai');
const chaiSubset = require('chai-subset');
const dataset = require('./datasets');
const { prepareElection } = require('../helpers');

chai.use(chaiSubset);

describe('STV Strict Logic', () => {
  it('should not resolve for the strict election in dataset 7', async function () {
    const election = await prepareElection(dataset.dataset7);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 14,
      seats: 1,
      voteCount: 20,
      useStrict: true,
      result: {
        status: 'UNRESOLVED',
        winners: [],
      },
    });
  });
  it('should not resolve for the strict election in dataset 8', async function () {
    const election = await prepareElection(dataset.dataset8);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 15,
      seats: 1,
      voteCount: 21,
      useStrict: true,
      result: {
        status: 'UNRESOLVED',
        winners: [],
      },
    });
  });
  it('should not resolve for the strict election in dataset 9', async function () {
    const election = await prepareElection(dataset.dataset9);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 21,
      seats: 1,
      voteCount: 30,
      useStrict: true,
      result: {
        status: 'UNRESOLVED',
        winners: [],
      },
    });
  });
  it('should resolve for the strict election in dataset 10', async function () {
    const election = await prepareElection(dataset.dataset10);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 21,
      seats: 1,
      voteCount: 31,
      useStrict: true,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'A' }],
      },
    });
  });
});
