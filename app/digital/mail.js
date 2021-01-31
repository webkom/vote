const nodemailer = require('nodemailer');
const env = require('../../env');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

let creds = {};
let transporter = null;

// Mail transporter object Google service account
if (env.GOOGLE_AUTH) {
  // Get google auth creds from env
  creds = JSON.parse(Buffer.from(env.GOOGLE_AUTH, 'base64').toString());
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.FROM_MAIL,
      serviceClient: creds.client_id,
      privateKey: creds.private_key,
    },
  });
  transporter.verify(function (error, success) {
    if (error) {
      console.log('SMTP connection error', error); // eslint-disable-line no-console
    } else {
      console.log('SMTP connection success', success); // eslint-disable-line no-console
    }
  });
}

// Mail transporter if STMP connection string is used
if (env.SMTP_URL) {
  transporter = nodemailer.createTransport(env.SMTP_URL);
  transporter.verify(function (error, success) {
    if (error) {
      console.log('SMTP connection error', error); // eslint-disable-line no-console
    } else {
      console.log('SMTP connection success', success); // eslint-disable-line no-console
    }
  });
}

exports.mailHandler = async (action, data) => {
  const html = fs.readFileSync(
    path.resolve(__dirname, './template.html'),
    'utf8'
  );
  const template = handlebars.compile(html);
  let { email, username, password } = data;
  username = username && username.replace(/\W/g, '');
  password = password && password.replace(/\W/g, '');

  let replacements = {
    logo: env.LOGO_SRC,
    username,
    password,
    link: `${env.FRONTEND_URL}/auth/login?token=${username}:${password}:`,
  };
  switch (action) {
    case 'reject':
      replacements = {
        ...replacements,
        new: false,
        title: 'Allerede aktivert bruker!',
      };
      break;
    case 'resend':
      replacements = {
        ...replacements,
        new: true,
        title: 'Velkommen til Genfors!',
      };
      break;
    case 'send':
      replacements = {
        ...replacements,
        new: true,
        title: 'Velkommen til Genfors!',
      };
      break;
  }
  const templatedHTML = template(replacements);

  // If we have not set any custom transporter we just use console mail
  // We do this after the the templating to make sure the template still
  // works even tho we dont use it.
  if (!transporter) {
    return new Promise(function (resolve, _) {
      console.log('MAIL:', action, data); // eslint-disable-line no-console
      resolve('Done');
    });
  }

  return transporter.sendMail({
    from: `VOTE - ${process.env.FROM} <${process.env.FROM_MAIL}>`,
    to: `${email}`,
    subject: `VOTE Login Credentials`,
    text: `Username: ${username}, Password: ${password}`,
    html: templatedHTML,
  });
};
