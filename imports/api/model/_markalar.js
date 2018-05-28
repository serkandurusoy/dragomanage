import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { MENSEILER } from '/imports/environment/enums';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';
import { Urunler } from './';

export const Markalar = new Mongo.Collection('markalar');

Markalar.Schema = new SimpleSchema({
  tip: {
    label: 'Tip',
    type: String,
    index: 1,
    allowedValues: Object.keys(MENSEILER).map(v => MENSEILER[v].value),
  },
  isim: {
    label: 'İsim',
    type: String,
    index: 1,
    unique: true,
    min: 2,
    max: 50,
    autoValue() {
      if (this.isSet) {
        return this.value.toTitleCase();
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

Markalar.selectOptions = (tip, updateForm) => {
  let selector = {};

  if (tip) {
    selector.tip = tip;
  }

  if (!updateForm) {
    selector.aktif = true;
  }

  return Markalar
    .find(selector, {sort: {isim: 1}})
    .map(e => ({value: e._id, label: e.isim, disabled: !e.aktif}));

};

Markalar.attachSchema(Markalar.Schema);

Markalar.vermongo({timestamps: true, userId: 'recordedBy'});

if (Meteor.isServer) {
  const collate = require('/imports/utils/server/collate').default;
  collate(Markalar, ['isim']);
}

const collatedSort = require('/imports/utils/collated-sort').default;
collatedSort(Markalar, ['isim']);

function helpers() {
  return {
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
  };
}

Markalar.helpers(helpers.apply(this));
Markalar.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Markalar.rawCollection().createIndex({ tip: 1, isim: 1 });
  Markalar.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Markalar.after.insert(function(userId, doc) {
    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.MARKA.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references: [doc._id],
    });
  });

  Markalar.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Markanın'];

    if (this.previous.tip !== doc.tip) {
      notes.push('tipi değiştirildi')
    }

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
      collection: COLLECTIONS.MARKA.value,
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

  Markalar.after.update(function(userId, doc, fieldNames, modifier, options) {
    if (this.previous.isim !== doc.isim) {
      Urunler.find({marka: doc._id})
        .forEach(urun => Urunler.update(urun._id, {$set:{
          marka: urun.marka,
        }}))
    }
  }, {fetchPrevious: true});

}
