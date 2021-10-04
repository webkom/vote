const dataset = require('./datasets');
const { prepareElection } = require('../helpers');

describe('Strict Logic', () => {
  it('should not resolve for the strict election in dataset 7', async function () {
    const election = await prepareElection(dataset.dataset7);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 122,
      voteCount: 182,
      blankVoteCount: 17,
      useStrict: true,
      result: {
        status: 'UNRESOLVED',
        winner: undefined,
      },
      log: {
        Ja: 117,
        Nei: 48,
        blank: 17,
      },
    });
  });

  it('should resolve for the strict election in dataset 8', async function () {
    const election = await prepareElection(dataset.dataset8);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 116,
      voteCount: 173,
      blankVoteCount: 10,
      useStrict: true,
      result: {
        status: 'RESOLVED',
        winner: { alternative: 'Ny Struktur', count: 123 },
      },
      log: {
        'Ny Struktur': 123,
        'Gammel Struktur': 40,
        blank: 10,
      },
    });
  });

  it('should not resolve for the clone strict election in dataset 9', async function () {
    const election = await prepareElection(dataset.dataset9);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 101,
      voteCount: 150,
      blankVoteCount: 10,
      useStrict: true,
      result: {
        status: 'UNRESOLVED',
        winner: undefined,
      },
      log: {
        Utvalg: 100,
        'Ikke Utvalg': 40,
        blank: 10,
      },
    });
  });
});
