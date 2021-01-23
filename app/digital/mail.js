const nodemailer = require('nodemailer');
const env = require('../../env');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

let creds = {};
let transporter = {};
let from = '';

// Mail transporter object for production Google mail
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
  from = `VOTE - Abakus <${creds.abakus_from_mail}>`;
}

// Mail transporter object for dev Ethereal mail
if (env.NODE_ENV === 'development' && env.ETHEREAL) {
  const [user, pass] = env.ETHEREAL.split(':');
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user,
      pass,
    },
  });
  from = `VOTE(TEST) - Abakus <${user}>`;
}

exports.mailHandler = async (action, data) => {
  const html = fs.readFileSync(
    path.resolve(__dirname, './template.html'),
    'utf8'
  );
  const template = handlebars.compile(html);
  const { email, username, password } = data;

  let replacements = {};
  switch (action) {
    case 'reject':
      replacements = {
        title: 'Allerede aktivert bruker',
        description:
          'Du har allerede motatt en bruker, og vi har registrert at du har klart å logge inn.',
      };
      break;
    case 'resend':
      replacements = {
        title: 'Velkommen til Genfors',
        description:
          'Dette er din digitale bruker. Dette er den samme brukeren, men med nytt generert passord.',
        username: username.replace(/\W/g, ''),
        password: password.replace(/\W/g, ''),
      };
      break;
    case 'send':
      replacements = {
        title: 'Velkommen til Genfors',
        description:
          'Dette er din digital bruker til stemmesystemet VOTE. Mer info kommer på Genfors.',
        username: username.replace(/\W/g, ''),
        password: password.replace(/\W/g, ''),
      };
      break;
  }

  return transporter.sendMail({
    from,
    to: `${email}`,
    subject: `VOTE Login Credentials`,
    text: `Username: ${username}, Password: ${password}`,
    html: template(replacements),
  });
};
