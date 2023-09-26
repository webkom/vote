import { ElectionSystems as ElectionTypes } from '../../app/types/types';

import Alternative from '../../app/models/alternative';
import Election from '../../app/models/election';
import Vote from '../../app/models/vote';
import User from '../../app/models/user';
import Register from '../../app/models/register';
import { getLatestEmail } from '../plugins/smtp-test-server';

const activeSTVElectionData = {
  title: 'activeElectionSTV',
  type: ElectionTypes.STV,
  description: 'active election STV',
  active: true,
};

const activeNormalElectionData = {
  title: 'activeElection NORMAL',
  type: ElectionTypes.NORMAL,
  description: 'active election NORMAL',
  active: false,
};

const activeBlankElectionData = {
  title: 'activeElection NORMAL - Blank',
  type: ElectionTypes.NORMAL,
  description: 'active election NORMAL',
  active: false,
};

const testAlternative = {
  description: 'first test alternative',
};
const testAlternative2 = {
  description: 'another test alternative',
};
const testAlternative3 = {
  description: 'last test alternative',
};

const cypressTasks: Cypress.Tasks = {
  getLatestEmail,
  async clearCollections() {
    await Promise.all(
      [Alternative, Register, Election, Vote, User].map((collection) =>
        collection.deleteMany(null)
      )
    );
    return null;
  },
  log(m) {
    console.log(m);
    return null;
  },
  async createElections() {
    const alternatives = [testAlternative, testAlternative2, testAlternative3];

    const stvElection = await new Election(activeSTVElectionData);

    const normalElection = await new Election(activeNormalElectionData);
    const blankElection = await new Election(activeBlankElectionData);

    const normalAlternatives = await Promise.all(
      alternatives.map((alternative) => new Alternative(alternative))
    );

    const stvAlternatives = await Promise.all(
      alternatives.map((alternative) => new Alternative(alternative))
    );
    const blankAlternatives = await Promise.all(
      alternatives.map((alternative) => new Alternative(alternative))
    );

    for (let i = 0; i < alternatives.length; i++) {
      await stvElection.addAlternative(stvAlternatives[i]);
      await normalElection.addAlternative(normalAlternatives[i]);
      await blankElection.addAlternative(blankAlternatives[i]);
    }

    return [
      stvElection,
      normalElection,
      blankElection,
      stvAlternatives,
      normalAlternatives,
    ];
  },
  async createUsers() {
    const hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'

    const testUser = {
      username: 'testuser',
      cardKey: '99TESTCARDKEY',
      hash,
    };

    const adminUser = {
      username: 'admin',
      admin: true,
      moderator: true,
      cardKey: '55TESTCARDKEY',
      hash,
    };

    const moderatorUser = {
      username: 'moderator',
      admin: false,
      moderator: true,
      cardKey: '67TESTCARDKEY',
      hash,
    };

    return await Promise.all(
      [testUser, adminUser, moderatorUser].map(async (u) => {
        const exists = await User.exists({ username: u.username });
        if (exists) return User.findOne({ username: u.username });
        return User.create(u);
      })
    );
  },
  async setNormalElection() {
    const normalElection = await Election.findOne({
      title: activeNormalElectionData.title,
    });
    const stvElection = await Election.findOne({
      title: activeSTVElectionData.title,
    });
    stvElection.active = false;
    stvElection.save();

    normalElection.active = true;
    normalElection.save();
    return null;
  },
  async setBlankElection() {
    const normalElection = await Election.findOne({
      title: activeNormalElectionData.title,
    });
    const blankElection = await Election.findOne({
      title: activeBlankElectionData.title,
    });
    normalElection.active = false;
    normalElection.save();

    blankElection.active = true;
    blankElection.save();
    return null;
  },
};

export default cypressTasks;
