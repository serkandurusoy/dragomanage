import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';
import { Kasalar, Kurlar } from './';
import { KURLAR, KASALAR } from '/imports/environment/enums';

export const KasaTransferleri = new Mongo.Collection('kasaTransferleri');

KasaTransferleri.Schema = new SimpleSchema({
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
      const islemTarihi = this.field('islemTarihi');
      const kurCinsi = this.field('kur');
      const tutar = this.field('tutar');
      const tutarKurus = this.field('tutarKurus');
      if (islemTarihi.isSet && kurCinsi.isSet) {
        const kur = Kurlar.findOne({tarih: islemTarihi.value})[kurCinsi.value];
        return Math.round(kur * ((tutar.value || 0) * 100 + (tutarKurus.value || 0)));
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
  kasaKaynak: {
    label: 'Kaynak kasa',
    type: String,
    index: 1,
    custom() {
      const kur = this.field('kur');
      if (this.isSet && kur.isSet && !!this.value && Kasalar.findOne({_id: this.value, kur: kur.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && kur.isSet && !!this.value && !Kasalar.findOne({_id: this.value, kur: kur.value})) {
        return 'kasaKuruHatali';
      }
    },
  },
  kasaHedef: {
    label: 'Hedef kasa',
    type: String,
    index: 1,
    custom() {
      const kur = this.field('kur');
      if (this.isSet && kur.isSet && !!this.value && Kasalar.findOne({_id: this.value, kur: kur.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && kur.isSet && !!this.value && !Kasalar.findOne({_id: this.value, kur: kur.value})) {
        return 'kasaKuruHatali';
      }
      const kasaKaynak = this.field('kasaKaynak');
      if (this.isSet && kasaKaynak.isSet) {
        if (this.value === kasaKaynak.value) {
          return 'kasalarFarkliOlmali'
        }
        const kaynakVade = Kasalar.findOne(kasaKaynak.value).tip === KASALAR.CEK_SENET.value;
        const hedefVade = Kasalar.findOne(this.value).tip === KASALAR.CEK_SENET.value;
        if (kaynakVade !== hedefVade) {
          return 'vadelerKarisamaz';
        }
      }
    },
  },
  islemTarihi: {
    label: 'İşlem tarihi',
    type: Date,
    index: -1,
    min: Date.sistemAcilis().isSameOrBefore(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter(),
    max: Date.today(),
    defaultValue: Date.today(),
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
});

KasaTransferleri.attachSchema(KasaTransferleri.Schema);

KasaTransferleri.vermongo({timestamps: true, userId: 'recordedBy'});

function helpers() {
  return {
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
    kasaKaynakLabel() {
      const kasa = Kasalar.findOne(this.kasaKaynak);
      return kasa && kasa.isim;
    },
    kasaHedefLabel() {
      const kasa = Kasalar.findOne(this.kasaHedef);
      return kasa && kasa.isim;
    },
    tutarLabel() {
      return ((this.tutarX100 || 0) / 100).toCurrencyDisplay(2,this.kur);
    },
    tutarLabelTL() {
      return ((this.tutarX100TL || 0) / 100).toCurrencyDisplay();
    },
  };
}

KasaTransferleri.helpers(helpers.apply(this));
KasaTransferleri.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  KasaTransferleri.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  KasaTransferleri.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.kasaKaynak) references.push(doc.kasaKaynak);
    if (doc.kasaHedef) references.push(doc.kasaHedef);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.KASA_TRANSFERI.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.islemTarihi.daysApartFromNow(),
      references,
    });
  });

  KasaTransferleri.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Kasa transferi'];

    if (doc.tutarX100 === 0) {
      notes.push('iptal edildi')
    }

    let references = [doc._id];
    if (this.previous.kasaKaynak) references.push(this.previous.kasaKaynak);
    if (doc.kasaKaynak) references.push(doc.kasaKaynak);
    if (this.previous.kasaHedef) references.push(this.previous.kasaHedef);
    if (doc.kasaHedef) references.push(doc.kasaHedef);
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.KASA_TRANSFERI.value,
      doc: doc._id,
      operation: 'update',
      version: doc._version,
      note: notes.length > 1 ? notes.join(', ').concat('.') : undefined,
      daysFromInsert: doc.createdAt.daysApartFromNow(),
      daysFromUpdate: this.previous.modifiedAt.daysApartFromNow(),
      daysFromRecord: [
        doc.createdAt.daysApartFromNow(),
        doc.islemTarihi.daysApartFromNow(),
        this.previous.islemTarihi.daysApartFromNow(),
      ].sort().reverse()[0],
      references,
    });
  }, {fetchPrevious: true});

}
