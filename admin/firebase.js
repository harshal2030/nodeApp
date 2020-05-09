const admin = require('firebase-admin');

const account = require('../../project-1b9c6-firebase-adminsdk-deiwj-5378d5bd37.json');

admin.initializeApp({
  credential: admin.credential.cert(account),
  databaseURL: 'https://project-1b9c6.firebaseio.com',
});

module.exports = admin;
