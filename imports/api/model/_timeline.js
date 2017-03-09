import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { COLLECTIONS } from '/imports/environment/meta';

export const Timeline = new Mongo.Collection('timeline');

Timeline.Schema = new SimpleSchema({
  recordedAt: {
    type: Date,
    index: -1,
    autoValue() { return new Date() },
  },
  recordedBy: {
    type: String,
    defaultValue: 'sistem',
    index: 1,
  },
  collection: {
    type: String,
    allowedValues: Object.keys(COLLECTIONS).map(v => COLLECTIONS[v].value),
    index: 1,
  },
  doc: {
    type: String,
  },
  operation: {
    type: String,
    allowedValues: ['insert','update'],
    index: 1,
  },
  version: {
    type: Number,
  },
  note: {
    type: String,
    optional: true,
  },
  daysFromInsert: {
    type: Number,
    optional: true,
  },
  daysFromUpdate: {
    type: Number,
    optional: true,
  },
  daysFromRecord: {
    type: Number,
  },
  references: {
    type: [String],
    index: 1,
  }
});

Timeline.attachSchema(Timeline.Schema);

Timeline.helpers({
  kullanici() {
    return this.recordedBy === 'sistem' ? 'Dragomanage Sistemi' : Meteor.users.findOne(this.recordedBy).kullanici().isim();
  },
  resim() {
    return this.recordedBy === 'sistem' ? '/favicon-96x96.png' : Meteor.users.findOne(this.recordedBy).kullanici().resim;
  },
  modalComponent() {
    return Object.keys(COLLECTIONS).map(k => COLLECTIONS[k]).find(e => e.value === this.collection.toString()).modal;
  },
  operationLabel() {
    return Object.keys(COLLECTIONS).map(k => COLLECTIONS[k]).find(e => e.value === this.collection.toString()).operationLabel;
  },
  currentUserYetkili() {
    return Meteor.user() && Meteor.user().yetkili(Object.keys(COLLECTIONS).map(k => COLLECTIONS[k]).find(e => e.value === this.collection.toString()).yetki);
  },
});
