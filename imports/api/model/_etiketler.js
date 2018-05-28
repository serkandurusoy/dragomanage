import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { ETIKETLER } from '/imports/environment/enums';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';

export const Etiketler = new Mongo.Collection('etiketler');

Etiketler.Schema = new SimpleSchema({
  tip: {
    label: 'Tip',
    type: String,
    index: 1,
    allowedValues: Object.keys(ETIKETLER).map(v => ETIKETLER[v].value),
    autoValue() {
      if (this.isUpdate && this.isSet) {
        this.unset();
      }
    },
  },
  isim: {
    label: 'İsim',
    type: String,
    index: 1,
    min: 2,
    max: 50,
    autoValue() {
      if (this.isSet) {
        return this.value.toSentenceCase();
      }
    },
  },
  aktif: {
    label: 'Aktif',
    type: Boolean,
    index: 1,
    defaultValue: true,
  },
});

Etiketler.selectOptions = (tip, updateForm) => {
  let selector = {tip};

  if (!updateForm) {
    selector.aktif = true;
  }

  return Etiketler
    .find(selector, {sort: {isim: 1}})
    .map(e => ({value: e._id, label: e.isim, disabled: !e.aktif}));

};

Etiketler.attachSchema(Etiketler.Schema);

Etiketler.vermongo({timestamps: true, userId: 'recordedBy'});

if (Meteor.isServer) {
  const collate = require('/imports/utils/server/collate').default;
  collate(Etiketler, ['isim']);
}

const collatedSort = require('/imports/utils/collated-sort').default;
collatedSort(Etiketler, ['isim']);

function helpers() {
  return {
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
  };
}

Etiketler.helpers(helpers.apply(this));
Etiketler.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Etiketler.rawCollection().createIndex({ tip: 1, isim: 1 }, { unique: true });
  Etiketler.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Etiketler.after.insert(function(userId, doc) {
    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.ETIKET.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references: [doc._id],
    });
  });

  Etiketler.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Etiketin'];

    if (this.previous.isim !== doc.isim) {
      notes.push('ismi değiştirildi')
    }

    if (this.previous.aktif && !doc.aktif) {
      notes.push('kullanımı donduruldu')
    }

    if (!this.previous.aktif && doc.aktif) {
      notes.push('kullanımı tekrar devreye alındı')
    }

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.ETIKET.value,
      doc: doc._id,
      operation: 'update',
      version: doc._version,
      note: notes.length > 1 ? notes.join(', ').concat('.') : undefined,
      daysFromInsert: doc.createdAt.daysApartFromNow(),
      daysFromUpdate: this.previous.modifiedAt.daysApartFromNow(),
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references: [doc._id],
    });
  }, {fetchPrevious: true});

}
