#!/usr/bin/env node

/* eslint no-console: 0 */

import { Command } from 'commander';
import mongoose, { HydratedDocumentFromSchema } from 'mongoose';
import chalk from 'chalk';
import promptly from 'promptly';
import User, { userSchema } from '../app/models/user';
const program = new Command();

function done(err: Error, user: HydratedDocumentFromSchema<typeof userSchema>) {
  if (err) throw err;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log(chalk.green(`Created user ${user.username}`));
  process.exit(0);
}

function validator(value: string) {
  if (typeof parseInt(value) !== 'number') {
    throw new Error('-------------\nNot a number!\n-------------');
  }
  if (![1, 2, 3].includes(parseInt(value))) {
    throw new Error('---------------\nMode out of range!\n---------------');
  }
  return value;
}

program
  .version('1.0.0')
  .command('create-user <username> <cardKey>')
  .description('create a new user')
  .action((username, cardKey) => {
    const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/vote';

    promptly.prompt(
      'Usermode: \n [1] for User \n [2] for Moderator \n [3] for Admin \n Enter mode: ',
      { validator, retry: true },
      (modeErr, mode) => {
        const modeId = parseInt(mode);
        mongoose.connect(mongoURL, {}, (connectErr) => {
          if (connectErr) return done(connectErr, null);

          promptly.password('Enter password: ', async (pwErr, password) => {
            if (pwErr) return done(pwErr, null);
            const user = new User({
              username: username,
              admin: modeId == 3,
              moderator: modeId == 2 || modeId == 3,
              cardKey: cardKey,
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const registeredUser = await User.register(user, password);
            done(null, registeredUser);
          });
        });
      }
    );
  });

program.parse(process.argv);
