import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';

export const GirisKayitlari = new Mongo.Collection('users.girisKayitlari');

GirisKayitlari.schema = new SimpleSchema({
  userId: {
    type: String,
    index: 1,
    autoValue() {
      return this.userId;
    },
  },
  email: {
    type: String,
    index: 1,
    autoValue() {
      const user = Meteor.users.findOne(this.userId);
      return user && user.email;
    },
  },
  loginTime: {
    type: Date,
    index: -1,
    autoValue() {
      return new Date();
    },
  },
  loginType: {
    type: String,
    index: 1,
  },
  loginMethod: {
    type: String,
    index: 1,
  },
  meteorConnectionId: {
    type: String,
  },
  clientIPAddress: {
    type: String,
  },
  host: {
    type: String,
    optional: true,
  },
  xForwardedFor: {
    type: String,
    optional: true,
  },
  userAgent: {
    type: Object,
    blackbox: true,
    optional: true,
  },
});

GirisKayitlari.attachSchema(GirisKayitlari.schema);

if (Meteor.isServer) {
  GirisKayitlari.rawCollection().createIndex({ email: 1, loginTime: -1 });
}
