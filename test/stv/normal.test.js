const chai = require('chai');
const chaiSubset = require('chai-subset');
const dataset = require('./datasets');
const { prepareElection } = require('../helpers');

chai.use(chaiSubset);

describe('STV Normal Logic', () => {
  it('should find 2 winners, and resolve for dataset 1', async function () {
    const election = await prepareElection(dataset.dataset1);
    const electionResult = await election.elect();

    electionResult.should.containSubset({
      thr: 34,
      seats: 2,
      voteCount: 100,
      useStrict: false,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Andrea' }, { description: 'Carter' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            Andrea: 45,
            Brad: 30,
            Carter: 25,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'Andrea' },
          voteCount: 45,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [{ description: 'Andrea' }],
          counts: {
            Brad: 30,
            Carter: 36,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'Carter' },
          voteCount: 36,
        },
      ],
    });
  });

  it('should find 2 winners, but not resolve for dataset 2', async function () {
    const election = await prepareElection(dataset.dataset2);
    const electionResult = await election.elect();

    electionResult.should.containSubset({
      thr: 6,
      seats: 3,
      voteCount: 20,
      useStrict: false,
      result: {
        status: 'UNRESOLVED',
        winners: [{ description: 'Chocolate' }, { description: 'Orange' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            Orange: 4,
            Pear: 2,
            Chocolate: 12,
            Strawberry: 1,
            Hamburger: 1,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'Chocolate' },
          voteCount: 12,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [{ description: 'Chocolate' }],
          counts: {
            Orange: 4,
            Pear: 2,
            Strawberry: 5,
            Hamburger: 3,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Pear' },
          minScore: 2,
        },
        {
          action: 'ITERATION',
          iteration: 3,
          winners: [{ description: 'Chocolate' }],
          counts: {
            Orange: 6,
            Strawberry: 5,
            Hamburger: 3,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'Orange' },
          voteCount: 6,
        },
        {
          action: 'ITERATION',
          iteration: 4,
          winners: [{ description: 'Chocolate' }, { description: 'Orange' }],
          counts: {
            Strawberry: 5,
            Hamburger: 3,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Hamburger' },
          minScore: 3,
        },
        {
          action: 'ITERATION',
          iteration: 5,
          counts: {
            Strawberry: 5,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Strawberry' },
          minScore: 5,
        },
        {
          action: 'ITERATION',
          iteration: 6,
          counts: {},
        },
      ],
    });
  });

  it('should find 4 winners, but not resolve for dataset 3', async function () {
    const election = await prepareElection(dataset.dataset3);
    const electionResult = await election.elect();

    electionResult.should.containSubset({
      thr: 108,
      seats: 5,
      voteCount: 647,
      useStrict: false,
      result: {
        status: 'UNRESOLVED',
        winners: [
          { description: 'EVANS' },
          { description: 'STEWART' },
          { description: 'AUGUSTINE' },
          { description: 'HARLEY' },
        ],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            STEWART: 66,
            VINE: 48,
            AUGUSTINE: 95,
            COHEN: 55,
            LENNON: 58,
            EVANS: 144,
            WILCOCKS: 60,
            HARLEY: 91,
            PEARSON: 30,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'EVANS' },
          voteCount: 144,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [{ description: 'EVANS' }],
          counts: {
            STEWART: 68,
            VINE: 68,
            AUGUSTINE: 95,
            COHEN: 64,
            LENNON: 58,
            WILCOCKS: 60,
            HARLEY: 92,
            PEARSON: 34,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'PEARSON' },
          minScore: 34,
        },
        {
          action: 'ITERATION',
          iteration: 3,
          winners: [{ description: 'EVANS' }],
          counts: {
            STEWART: 69,
            VINE: 91,
            AUGUSTINE: 96,
            COHEN: 69,
            LENNON: 58,
            WILCOCKS: 60,
            HARLEY: 93,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'LENNON' },
          minScore: 58,
        },
        {
          action: 'ITERATION',
          iteration: 4,
          winners: [{ description: 'EVANS' }],
          counts: {
            STEWART: 115,
            VINE: 97,
            AUGUSTINE: 96,
            COHEN: 71,
            WILCOCKS: 60,
            HARLEY: 93,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'STEWART' },
          voteCount: 115,
        },
        {
          action: 'ITERATION',
          iteration: 5,
          winners: [{ description: 'EVANS' }, { description: 'STEWART' }],
          counts: {
            VINE: 97,
            AUGUSTINE: 103,
            COHEN: 71,
            WILCOCKS: 60,
            HARLEY: 93,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'WILCOCKS' },
          minScore: 60,
        },
        {
          action: 'ITERATION',
          iteration: 6,
          winners: [{ description: 'EVANS' }, { description: 'STEWART' }],
          counts: {
            VINE: 104,
            AUGUSTINE: 135,
            COHEN: 72,
            HARLEY: 108,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'AUGUSTINE' },
          voteCount: 135,
        },
        {
          action: 'WIN',
          alternative: { description: 'HARLEY' },
          voteCount: 108,
        },
        {
          action: 'ITERATION',
          iteration: 7,
          winners: [
            { description: 'EVANS' },
            { description: 'STEWART' },
            { description: 'AUGUSTINE' },
            { description: 'HARLEY' },
          ],
          counts: {
            VINE: 104,
            COHEN: 72,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'COHEN' },
          minScore: 72,
        },
        {
          action: 'ITERATION',
          iteration: 8,
          counts: {
            VINE: 104,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'VINE' },
          minScore: 104,
        },
      ],
    });
  });
});
