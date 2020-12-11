const Alternative = require('../../app/models/alternative');
const Election = require('../../app/models/election');
const Vote = require('../../app/models/vote');
const crypto = require('crypto');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const dataset = require('./datasets');

chai.use(chaiSubset);

describe('STV Logic', () => {
  const prepareElection = async function (dataset) {
    // Takes the priorities from the dataset, as well as the amount of times
    // that priority combination should be repeated. This basically transforms
    // the dataset from a reduced format into the format used by the .elect()
    // method for a normal Vote-STV election. The reason the dataset are written
    // on the reduced format is for convenience, as it would be to hard to read
    // datasets with thousands of duplicate lines
    const repeat = async (priorities, amount) => {
      const resolvedAlternatives = await Promise.all(
        priorities.map((d) => Alternative.findOne({ description: d }))
      );
      return new Array(amount).fill(resolvedAlternatives);
    };

    // Step 1) Create Election
    const election = await Election.create({
      title: 'Title',
      description: 'Description',
      active: true,
      seats: dataset.seats,
    });
    // Step 2) Mutate alternatives and create a new Alternative for each
    const alternatives = await Promise.all(
      dataset.alternatives
        .map((a) => ({
          election: election._id,
          description: a,
        }))
        .map((a) => new Alternative(a))
    );
    // Step 3) Update election with alternatives
    for (let i = 0; i < alternatives.length; i++) {
      await election.addAlternative(alternatives[i]);
    }

    // Step 4) Create priorities from dataset
    const allPriorities = await Promise.all(
      dataset.priorities.flatMap((entry) =>
        repeat(entry.priority, entry.amount)
      )
    );
    // Step 5) Use the resolved priorities to create vote ballots
    const resolvedVotes = await Promise.all(
      allPriorities.flat().map((priorities) =>
        new Vote({
          hash: crypto.randomBytes(12).toString('hex'),
          priorities,
        }).save()
      )
    );

    // Set the votes and deactivate the election before saving
    election.votes = resolvedVotes;
    election.active = false;
    await election.save();

    return election;
  };

  it('should find 2 winners, and resolve for dataset 1', async function () {
    const election = await prepareElection(dataset.dataset1);
    const electionResult = await election.elect();

    electionResult.should.containSubset({
      thr: 34,
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

  it('should find 1 winner, and resolve for dataset 4', async function () {
    const election = await prepareElection(dataset.dataset4);
    const electionResult = await election.elect();

    electionResult.should.containSubset({
      thr: 103,
      result: {
        status: 'RESOLVED',
        winners: [{ description: 'Erna Solberg' }],
      },
      log: [
        {
          action: 'ITERATION',
          iteration: 1,
          winners: [],
          counts: {
            'Erna Solberg': 88,
            'Siv Jensen': 44,
            'Bent Høye': 72,
          },
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'Siv Jensen' },
          minScore: 44,
        },
        {
          action: 'ITERATION',
          iteration: 2,
          winners: [],
          counts: {
            'Erna Solberg': 132,
            'Bent Høye': 72,
          },
        },
        {
          action: 'WIN',
          alternative: { description: 'Erna Solberg' },
          voteCount: 132,
        },
      ],
    });
  });

  it('should calculate floating points correctly for dataset5', async function () {
    const election = await prepareElection(dataset.dataset5);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 8,
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

  it('should calculate floating points correctly for dataset6', async function () {
    const election = await prepareElection(dataset.dataset6);
    const electionResult = await election.elect();
    electionResult.should.containSubset({
      thr: 71,
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
          action: 'ELIMINATE',
          alternative: { description: 'G' },
          minScore: 0,
        },
        {
          action: 'ELIMINATE',
          alternative: { description: 'H' },
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
      ],
    });
  });
});
