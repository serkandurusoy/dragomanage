import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';
import { CariKartlar, Urunler, Kurlar } from './';
import { KURLAR, TALEPLER } from '/imports/environment/enums';

export const Talepler = new Mongo.Collection('talepler');

Talepler.Schema = new SimpleSchema({
  kaydeden: {
    label: 'Kaydeden',
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return this.userId;
      }
    },
  },
  islem: {
    label: 'İşlem',
    type: String,
    index: 1,
    allowedValues: Object.keys(TALEPLER).map(v => TALEPLER[v].value),
  },
  cariKart: {
    label: 'Cari kart',
    type: String,
    index: 1,
    custom() {
      if (this.isInsert && Meteor.isServer && this.isSet && !!this.value && !CariKartlar.findOne({_id: this.value})) {
        return 'notAllowed';
      }
    },
  },
  urun: {
    label: 'Ürün',
    type: String,
    index: 1,
    optional: true,
    autoValue() {
      const islem = this.field('islem');
      if (islem.isSet && ![TALEPLER.GIDER.value, TALEPLER.GELIR.value].includes(islem.value) && this.isSet) {
        this.unset();
      }
    },
    custom() {
      const islem = this.field('islem');
      if (islem.isSet && [TALEPLER.GELIR.value, TALEPLER.GIDER.value].includes(islem.value)) {
        if (this.isInsert && Meteor.isServer && this.isSet && !!this.value && !Urunler.findOne({_id: this.value})) {
          return 'notAllowed';
        }
        if (!this.isSet) {
          return 'required';
        }
      }
    },
  },
  adet: {
    label: 'Adet',
    type: Number,
    min: 1,
    max: 100000,
    defaultValue: 1,
    optional: true,
  },
  tutar: {
    label: 'Tutar',
    type: Number,
    min: 0,
    max: 100000,
    defaultValue: 0,
  },
  tutarKurus: {
    label: 'Kuruş',
    type: Number,
    min: 0,
    max: 99,
    defaultValue: 0,
  },
  tutarX100: {
    type: Number,
    min: 0,
    autoValue() {
      const tutar = this.field('tutar');
      const tutarKurus = this.field('tutarKurus');
      return (tutar.value || 0) * 100 + (tutarKurus.value || 0);
    },
  },
  tutarX100TL: {
    type: Number,
    min: 0,
    autoValue() {
      const kurCinsi = this.field('kur');
      const tutar = this.field('tutar');
      const tutarKurus = this.field('tutarKurus');
      const kur = Kurlar.findOne({tarih: Date.today()})[kurCinsi.value || KURLAR.TRY.value];
      return Math.round(kur * ((tutar.value || 0) * 100 + (tutarKurus.value || 0)));
    },
  },
  kur: {
    label: 'Kur',
    type: String,
    index: 1,
    allowedValues: Object.keys(KURLAR).map(v => KURLAR[v].value),
    defaultValue: KURLAR.TRY.value,
  },
  aciklama: {
    label: 'Açıklama',
    type: String,
    optional: true,
    max: 500,
    autoValue() {
      if (this.isSet) {
        return this.value.toTrimmed();
      }
    },
  },
  reference: {
    label: 'Referans',
    type: String,
    index: 1,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  islendi: {
    label: 'İşlendi',
    type: Boolean,
    index: 1,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
    custom() {
      if (this.isUpdate && !this.value) {
        return 'islendiIsartlenmeli';
      }
    }
  },
  aciklamaIslendi: {
    label: 'İşlenme açıklaması',
    type: String,
    optional: true,
    max: 500,
    autoValue() {
      if (this.isSet) {
        return this.value.toTrimmed();
      }
    },
  },
});

Talepler.attachSchema(Talepler.Schema);

Talepler.vermongo({timestamps: true, userId: 'recordedBy'});

function helpers() {
  return {
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
    kullanici() {
      return this.kaydeden && Meteor.users.findOne(this.kaydeden).kullanici().isim();
    },
    cariKartLabel() {
      const cariKart = CariKartlar.findOne(this.cariKart);
      return cariKart && `${cariKart.kisaIsim}${cariKart.unvan ? ` (${cariKart.unvan})`: ''}`;
    },
    urunLabel() {
      const urun = Urunler.findOne(this.urun);
      return urun && urun.label();
    },
    tutarLabel() {
      return ((this.tutarX100 || 0) / 100).toCurrencyDisplay(2,this.kur);
    },
    tutarLabelTL() {
      return ((this.tutarX100TL || 0) / 100).toCurrencyDisplay();
    },
  };
}

Talepler.helpers(helpers.apply(this));
Talepler.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Talepler.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Talepler.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.cariKart) references.push(doc.cariKart);
    if (doc.urun) references.push(doc.urun);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.TALEP.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references,
    });
  });

  Talepler.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Talep'];

    if (doc.tutarX100 === 0) {
      notes.push('işlendi')
    }

    let references = [doc._id];
    if (this.previous.cariKart) references.push(this.previous.cariKart);
    if (doc.cariKart) references.push(doc.cariKart);
    if (this.previous.urun) references.push(this.previous.urun);
    if (doc.urun) references.push(doc.urun);
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.TALEP.value,
      doc: doc._id,
      operation: 'update',
      version: doc._version,
      note: notes.length > 1 ? notes.join(', ').concat('.') : undefined,
      daysFromInsert: doc.createdAt.daysApartFromNow(),
      daysFromUpdate: this.previous.modifiedAt.daysApartFromNow(),
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references,
    });
  }, {fetchPrevious: true});

}
