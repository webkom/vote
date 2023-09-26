import ms, { type EmailInfo } from 'smtp-tester';

// starts the SMTP server at localhost:7777
const port = 7777;
const mailServer = ms.init(port);
console.log('mail server at port %d', port);

// [receiver email]: email text
const lastEmail: Record<string, string> = {};

// process all emails
mailServer.bind((addr, id, email) => {
  console.log('--- email to %s ---', email.headers.to);
  console.log(email.body);
  console.log('--- end ---');
  // store the email by the receiver email
  lastEmail[email.headers.to as string] = email.html || email.body;
});

export const getLatestEmail: Cypress.Task = (email: string) =>
  lastEmail[email] ?? null;
