import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { KASALAR, KURLAR } from '/imports/environment/enums';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';
import { Bakiye, Kurlar } from './';

export const Kasalar = new Mongo.Collection('kasalar');

Kasalar.Schema = new SimpleSchema({
  tip: {
    label: 'Tip',
    type: String,
    index: 1,
    allowedValues: Object.keys(KASALAR).map(v => KASALAR[v].value),
    autoValue() {
      if (this.isUpdate && this.isSet) {
        this.unset();
      }
    },
  },
  kur: {
    label: 'Kur',
    type: String,
    index: 1,
    allowedValues: Object.keys(KURLAR).map(v => KURLAR[v].value),
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

Kasalar.selectOptions = (tip, updateForm) => {
  let selector = {};

  if (tip) {
    selector.tip = tip;
  }

  if (!updateForm) {
    selector.aktif = true;
  }

  return Kasalar
    .find(selector, {sort: {isim: 1}})
    .map(e => ({value: e._id, label: e.isim, disabled: !e.aktif}));

};

Kasalar.attachSchema(Kasalar.Schema);

Kasalar.vermongo({timestamps: true, userId: 'recordedBy'});

if (Meteor.isServer) {
  const collate = require('/imports/utils/server/collate').default;
  collate(Kasalar, ['isim']);
}

const collatedSort = require('/imports/utils/collated-sort').default;
collatedSort(Kasalar, ['isim']);

function helpers() {
  return {
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
    bakiyeLabel() {
      const bakiye = Bakiye.Kasa.findOne({kasa: this._id});
      return ( (!bakiye ? 0 : bakiye.tutarX100) / 100 ).toCurrencyDisplay(2, this.kur);
    },
    bakiyeLabelTL() {
      const bakiye = Bakiye.Kasa.findOne({kasa: this._id});
      return ((!bakiye ? 0 : bakiye.tutarX100) / 100 * Kurlar.findOne({tarih: Date.today()})[this.kur]).toCurrencyDisplay();
    },
    bakiyeAcilisLabel() {
      const bakiye = Bakiye.Kasa.Acilis.findOne({kasa: this._id});
      return ( (!bakiye ? 0 : bakiye.tutarX100) / 100 ).toCurrencyDisplay(2, this.kur);
    },
    bakiyeAcilisLabelTL() {
      const bakiye = Bakiye.Kasa.Acilis.findOne({kasa: this._id});
      return ((!bakiye ? 0 : bakiye.tutarX100) / 100 * Kurlar.findOne({tarih: Date.sistemAcilis()})[this.kur]).toCurrencyDisplay();
    },
  };
}

Kasalar.helpers(helpers.apply(this));
Kasalar.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Kasalar.rawCollection().createIndex({ tip: 1, kur: 1, isim: 1 }, { unique: true });
  Kasalar.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Kasalar.after.insert(function(userId, doc) {
    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.KASA.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references: [doc._id],
    });
  });

  Kasalar.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Kasanın'];

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
      collection: COLLECTIONS.KASA.value,
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
