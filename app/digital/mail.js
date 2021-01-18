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

exports.mailHandler = async (user, email) => {
  const { username, password } = user;
  // Safe username and password
  const cleanUsername = username.replace(/\W/g, '');
  const cleanPassword = password.replace(/\W/g, '');
  const html = fs
    .readFileSync(path.resolve(__dirname, './template.html'), 'utf8')
    .replace('{{USERNAME}}', cleanUsername)
    .replace('{{PASSWORD}}', cleanPassword);
  return transporter.sendMail({
    from: `VOTE - Abakus <${creds.abakus_from_mail}>`,
    to: `${email}`,
    subject: `VOTE Login Credentials`,
    text: `Username: ${cleanUsername}, Password: ${cleanPassword}`,
    html: html,
  });
};
