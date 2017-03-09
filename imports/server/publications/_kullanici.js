import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Kullanicilar, GirisKayitlari } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('userGirisKayitlari', function(args) {
  new SimpleSchema({
    userId: {
      type: String,
    },
    limit: {
      type: Number,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.SECRET.value);
  if (yetkili) {
    return [
      GirisKayitlari.find(
        {userId: args.userId},
        {
          sort: {loginTime: -1},
          limit: args.limit,
        }
      ),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('kullanici', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.SECRET.value);
  if (yetkili) {
    return [
      Kullanicilar.find(args._id),
      Kullanicilar.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('currentUser', function() {
  this.unblock();
  if (this.userId) {
    const currentUser = Meteor.users.findOne(this.userId);
    return [
      Kullanicilar.find({email: currentUser.email}),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('kullanicilar', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {
    return [
      Meteor.users.find(
        {}, {fields: {
          _id:1,
          email: 1,
        }}),
      Kullanicilar.find(),
    ];
  } else {
    this.ready();
  }
});
