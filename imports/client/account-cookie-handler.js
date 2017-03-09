import { Accounts } from 'meteor/accounts-base';
import cookie from 'cookie-dough';

Accounts.onLogin(() => {

  const token = {
    loginToken: localStorage['Meteor.loginToken'],
    expires: new Date(localStorage['Meteor.loginTokenExpires']),
  };

  cookie().set('dragomanage', token.loginToken, {
    domain: Meteor.absoluteUrl().split('/')[2].split(':')[0],
    path: "/",
    expires: token.expires,
    //httpOnly: true,
    //secure: Meteor.isProduction,
  });

});

Accounts.onLogout(() => {

  cookie().set('dragomanage', '', {
    domain: Meteor.absoluteUrl().split('/')[2].split(':')[0],
    path: "/",
    expires: new Date(0),
    //httpOnly: true,
    //secure: Meteor.isProduction,
  });

});
