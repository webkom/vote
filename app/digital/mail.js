const nodemailer = require('nodemailer');
const env = require('../../env');
const fs = require('fs');
const path = require('path');

let creds = {};
let transporter = {};
if (env.NODE_ENV === 'production') {
  // Get google auth creds from env
  creds = JSON.parse(Buffer.from(env.GOOGLE_AUTH, 'base64').toString());
  transporter = nodemailer.createTransport({
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
}

exports.mailHandler = async (user, email) => {
  const { username, password } = user;
  // Safe username and password
  const cleanUsername = username.replace(/\W/g, '');
  const cleanPassword = password.replace(/\W/g, '');
  const html = fs
    .readFileSync(path.resolve(__dirname, './template.html'), 'utf8')
    .replace('{{USERNAME}}', cleanUsername)
    .replace('{{PASSWORD}}', cleanPassword);

  if (env.NODE_ENV === 'development') {
    console.log('MAIL IS NOT SENT IN DEVELOPMENT'); // eslint-disable-line no-console
    return new Promise(function (res, _) {
      console.log('username:', cleanUsername, 'password:', cleanPassword); // eslint-disable-line no-console
      res('');
    })
      .then(function (succ) {
        return succ;
      })
      .then(function (err) {
        return err;
      });
  }
  return transporter.sendMail({
    from: `VOTE - Abakus <${creds.abakus_from_mail}>`,
    to: `${email}`,
    subject: `VOTE Login Credentials`,
    text: `Username: ${cleanUsername}, Password: ${cleanPassword}`,
    html: html,
  });
};
