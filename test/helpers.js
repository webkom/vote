import mongoose from 'mongoose';
import Alternative from '../app/models/alternative';
import Election from '../app/models/election';
import Vote from '../app/models/vote';
import User from '../app/models/user';
import Register from '../app/models/register';
import crypto from 'crypto';

export const dropDatabase = () =>
  mongoose.connection.dropDatabase().then(() => mongoose.disconnect());

export const clearCollections = () => {
  return Promise.all(
    [Alternative, Register, Election, Vote, User].map((collection) =>
      collection.deleteMany({})
    )
  );
};

const hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'
export const testUser = {
  username: 'testuser',
  cardKey: '99TESTCARDKEY',
  hash,
};

export const adminUser = {
  username: 'admin',
  admin: true,
  moderator: true,
  cardKey: '55TESTCARDKEY',
  hash,
};

export const moderatorUser = {
  username: 'moderator',
  admin: false,
  moderator: true,
  cardKey: '67TESTCARDKEY',
  hash,
};

export const createUsers = () =>
  Promise.all(
    [testUser, adminUser, moderatorUser].map(async (u) => {
      const exists = await User.exists({ username: u.username });
      if (exists) return User.findOne({ username: u.username });
      return User.create(u);
    })
  );

export const prepareElection = async function (dataset) {
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
    type: dataset.type,
    useStrict: dataset.useStrict,
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
    dataset.priorities.flatMap((entry) => repeat(entry.priority, entry.amount))
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
