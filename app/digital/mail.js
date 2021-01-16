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

const transporterTest = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'aileen.trantow@ethereal.email',
    pass: 'Ejw5B3KC9HSnbKcz5d',
  },
});

exports.mailHandler = async (user, pass) => {
  const html = fs
    .readFileSync(path.resolve(__dirname, './template.html'), 'utf8')
    .replace('{{USERNAME}}', user.username)
    .replace('{{PASSWORD}}', pass);
  return transporterTest.sendMail({
    from: `"Abakus <${creds.abakus_from_mail}>`,
    to: `${user.username} <${user.username}@stud.ntnu.no}>`,
    subject: `VOTE Login Credentials: ${user.username}`,
    text: `Username: ${user.username}, Password: ${pass}`,
    html: html,
  });
};
