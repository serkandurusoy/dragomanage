import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { COLLECTIONS } from '/imports/environment/meta';
import { KONUMLAR } from '/imports/environment/enums';
import { Timeline } from './_timeline';
import { Konumlar, Urunler } from './';

export const StokTransferleri = new Mongo.Collection('stokTransferleri');

StokTransferleri.Schema = new SimpleSchema({
  adet: {
    label: 'Adet',
    type: Number,
    min: 0,
    max: 100000,
    defaultValue: 0,
  },
  urun: {
    label: 'Ürün',
    type: String,
    index: 1,
    custom() {
      if (this.isSet && !!this.value && Urunler.findOne({_id: this.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && !!this.value && Urunler.findOne({_id: this.value, stokTakipli: false})) {
        return 'urunStokTakibindeDegil';
      }
    },
  },
  konumKaynak: {
    label: 'Kaynak konum',
    type: String,
    index: 1,
    custom() {
      if (this.isSet && !!this.value && Konumlar.findOne({_id: this.value, aktif: false})) {
        return 'hasInactiveValue';
      }
    },
  },
  konumHedef: {
    label: 'Hedef konum',
    type: String,
    index: 1,
    custom() {
      if (this.isSet && !!this.value && Konumlar.findOne({_id: this.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      const konumKaynak = this.field('konumKaynak');
      if (this.isSet && konumKaynak.isSet) {
        if (this.value === konumKaynak.value) {
          return 'konumlarFarkliOlmali'
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

StokTransferleri.attachSchema(StokTransferleri.Schema);

StokTransferleri.vermongo({timestamps: true, userId: 'recordedBy'});

function helpers() {
  return {
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
    urunLabel() {
      const urun = Urunler.findOne(this.urun);
      return urun && urun.label();
    },
    konumKaynakLabel() {
      const konum = Konumlar.findOne(this.konumKaynak);
      return konum && konum.isim;
    },
    konumKaynakTipLabel() {
      const konum = Konumlar.findOne(this.konumKaynak);
      return konum && konum.tip.enumValueToLabel(KONUMLAR);
    },
    konumHedefLabel() {
      const konum = Konumlar.findOne(this.konumHedef);
      return konum && konum.isim;
    },
    konumHedefTipLabel() {
      const konum = Konumlar.findOne(this.konumHedef);
      return konum && konum.tip.enumValueToLabel(KONUMLAR);
    },
  };
}

StokTransferleri.helpers(helpers.apply(this));
StokTransferleri.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  StokTransferleri.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  StokTransferleri.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.urun) references.push(doc.urun);
    if (doc.konumKaynak) references.push(doc.konumKaynak);
    if (doc.konumHedef) references.push(doc.konumHedef);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.STOK_TRANSFERI.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.islemTarihi.daysApartFromNow(),
      references,
    });
  });

  StokTransferleri.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Stok transferi'];

    if (doc.tutarX100 === 0) {
      notes.push('iptal edildi')
    }

    let references = [doc._id];
    if (this.previous.urun) references.push(this.previous.urun);
    if (doc.urun) references.push(doc.urun);
    if (this.previous.konumKaynak) references.push(this.previous.konumKaynak);
    if (doc.konumKaynak) references.push(doc.konumKaynak);
    if (this.previous.konumHedef) references.push(this.previous.konumHedef);
    if (doc.konumHedef) references.push(doc.konumHedef);
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.STOK_TRANSFERI.value,
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
