const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const creds = require('./client_secret.json');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: creds.abakus_from_mail,
    serviceClient: creds.client_id,
    privateKey: creds.private_key,
  },
});

exports.mailHandler = async (username, email, pass) => {
  const html = fs
    .readFileSync(path.resolve(__dirname, './template.html'), 'utf8')
    .replace('{{USERNAME}}', username)
    .replace('{{PASSWORD}}', pass);
  return transporter.sendMail({
    from: `VOTE - Abakus <${creds.abakus_from_mail}>`,
    to: `${username} <${email}>`,
    subject: `VOTE Login Credentials: ${username}`,
    text: `Username: ${username}, Password: ${pass}`,
    html: html,
  });
};
