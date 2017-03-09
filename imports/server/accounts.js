import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts } from 'meteor/accounts-base';
import { Kullanicilar, GirisKayitlari } from '/imports/api/model';
import uaParser from 'ua-parser-js';

ServiceConfiguration.configurations.upsert(
  {service: 'google'},
  {
    $set: {
      clientId: '707995421686-38ja0iqvgd7rv1p3pk3ldj0s1cohu31d.apps.googleusercontent.com',
      secret: 'HU5Nhhlt-HBXiUXVYHT4b6Vo',
    }
  }
);

const checkEmailAgainstAllowed = (email) => {
  const allowedEmails = Kullanicilar.find().map(kullanici=>kullanici.email);
  const userEmail = email.toLowerCase();
  return _.contains(allowedEmails, userEmail);
};

Accounts.config({
    loginExpirationInDays: 1,
    restrictCreationByEmailDomain(email) {
      if (!email) {
        throw new Meteor.Error(403,'Giriş yapmak içi kayıtlı bir eposta adresi gerekli.');
      }
      if (!checkEmailAgainstAllowed(email)) {
        throw new Meteor.Error(403,'Bu hesapla giriş yapmak için yetkiniz yok.');
      }
      return true;
    }
  }
);

Accounts.onCreateUser((options,user) => {
  const newUser = Object.assign({}, user, {
    email: user.services.google.email.toLowerCase(),
  });
  Kullanicilar.update({
    email: user.services.google.email.toLowerCase()
  }, {
    $set: {
      ad: user.services.google.given_name,
      soyad: user.services.google.family_name,
      resim: user.services.google.picture,
    }
  });
  delete newUser.profile;
  return newUser;
});

Accounts.onLogin(function(loginAttempt) {
  const {
    type: loginType,
    methodName: loginMethod,
    user,
    connection: {
      id: meteorConnectionId,
      clientAddress: clientIPAddress,
      httpHeaders
    }
  } = loginAttempt;

  GirisKayitlari.insert({
    loginType,
    loginMethod,
    meteorConnectionId,
    clientIPAddress,
    userAgent: uaParser(httpHeaders['user-agent']),
    host: httpHeaders['host'],
    xForwardedFor: httpHeaders['x-forwarded-for'],
  });

});

Meteor.users.deny({
  insert() {return true},
  update() {return true},
  remove() {return true},
});
