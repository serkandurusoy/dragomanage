import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { Etiketler, Markalar, Siniflar, Bakiye, Konumlar } from './';
import { ETIKETLER, URUNLER, KDVLER, SINIFLAR, MENSEILER, KURLAR } from '/imports/environment/enums';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';
import { Kurlar } from './';

export const Urunler = new Mongo.Collection('urunler');

Urunler.Schema = new SimpleSchema({
  tip: {
    label: 'Tip',
    type: String,
    index: 1,
    allowedValues: Object.keys(URUNLER).map(v => URUNLER[v].value),
  },
  sinif: {
    label: 'Sınıf',
    type: String,
    index: 1,
    custom() {
      if (this.isSet && !!this.value && Siniflar.findOne({_id: this.value, tip: SINIFLAR.SINIF.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && !!this.value && !Siniflar.findOne({_id: this.value, tip: SINIFLAR.SINIF.value})) {
        return 'notAllowed';
      }
    },
  },
  etiketler: {
    label: 'Etiketler',
    type: Array,
    index: 1,
    autoValue() {
      if (!this.isSet || this.value === null) {
        return [];
      }
    },
    custom() {
      if (this.isSet && Etiketler.findOne({_id: {$in: this.value}, tip: ETIKETLER.URUN.value, aktif: false})) {
        return 'hasInactiveValue'
      }
    },
  },
  'etiketler.$': {
    label: 'Etiketler',
    type: String,
    custom() {
      if (this.isSet && !Etiketler.findOne({_id: this.value, tip: ETIKETLER.URUN.value})) {
        return 'notAllowed';
      }
    },
  },
  mensei: {
    label: 'Menşei',
    type: String,
    optional: true,
    allowedValues: Object.keys(MENSEILER).map(v => MENSEILER[v].value),
  },
  marka: {
    label: 'Marka',
    optional: true,
    type: String,
    custom() {
      if (this.isSet && !!this.value && Markalar.findOne({_id: this.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && !!this.value && !Markalar.findOne({_id: this.value})) {
        return 'notAllowed';
      }
    },
  },
  markaLabel: {
    type: String,
    optional: true,
    index: 1,
    autoValue() {
      const marka = this.field('marka');
      if (marka.isSet && marka.value) {
        const urunMarka = Markalar.findOne(marka.value);
        return urunMarka && urunMarka.isim;
      } else {
        this.unset();
      }
    }
  },
  isim: {
    label: 'İsim',
    type: String,
    index: 1,
    unique: true,
    min: 2,
    max: 100,
    autoValue() {
      if (this.isSet) {
        return this.value.toTitleCase();
      }
    },
  },
  kdv: {
    label: 'Kdv',
    type: Number,
    allowedValues: Object.keys(KDVLER).map(v => KDVLER[v].value),
  },
  satilabilir: {
    label: 'Satılabilir',
    type: Boolean,
    index: 1,
    defaultValue: false,
    custom() {
      const sinif = this.field('sinif');
      if (sinif.isSet && !!sinif.value && this.isSet && this.value === true) {
        const sinifGelirOzellikli = Siniflar.findOne({_id: sinif.value, gelir: true, aktif: true});
        if (!sinifGelirOzellikli) {
          return 'sinifGelirDegil';
        }
      }
    },
  },
  gelireUygun: {
    label: 'Gelir',
    type: Boolean,
    index: 1,
    optional: true,
    autoValue() {
      const sinif = this.field('sinif');
      if (sinif.isSet) {
        const sinifDoc = Siniflar.findOne({_id: sinif.value});
        return !!sinifDoc.gelir;
      }
    },
  },
  gidereUygun: {
    label: 'Gider',
    type: Boolean,
    index: 1,
    optional: true,
    autoValue() {
      const sinif = this.field('sinif');
      if (sinif.isSet) {
        const sinifDoc = Siniflar.findOne({_id: sinif.value});
        return !!sinifDoc.gider;
      }
    },
  },
  barkod: {
    label: 'Barkod',
    type: String,
    optional: true,
    index: 1,
    unique: true,
    sparse: true,
    min: 1,
    max: 16,
    regEx: /^\d{1,16}$/,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '').replace(/\D+/g, '');
      }
    },
    custom() {
      const satilabilir = this.field('satilabilir');
      if (satilabilir.isSet && satilabilir.value === true && !this.isSet) {
        return 'required';
      }
    },
  },
  stokTakipli: {
    label: 'Stok takipli',
    type: Boolean,
    index: 1,
    optional: true,
    autoValue() {
      const satilabilir = this.field('satilabilir');
      if (satilabilir.isSet && satilabilir.value === true && !this.isSet) {
        return false;
      }
    },
  },
  stokUyariLimiti: {
    label: 'Stok uyarı limiti',
    type: Number,
    index: 1,
    optional: true,
    min: 0,
    autoValue() {
      const satilabilir = this.field('satilabilir');
      if (satilabilir.isSet && satilabilir.value === true && !this.isSet) {
        return 0;
      }
    },
  },
  fiyat: {
    label: 'Fiyat',
    type: Number,
    min: 0,
    optional: true,
    custom() {
      const satilabilir = this.field('satilabilir');
      if (satilabilir.isSet && satilabilir.value === true && !this.isSet) {
        return 'required';
      }
    },
  },
  ozelFiyat: {
    label: 'Özel fiyat',
    type: Number,
    min: 0,
    optional: true,
    custom() {
      const satilabilir = this.field('satilabilir');
      if (satilabilir.isSet && satilabilir.value === true && !this.isSet) {
        return 'required';
      }
      const fiyat = this.field('fiyat');
      if (fiyat.isSet && this.isSet && fiyat.value < this.value) {
        return 'ozelFiyatDusukOlmali';
      }
    },
  },
  kur: {
    label: 'Kur',
    type: String,
    optional: true,
    allowedValues: Object.keys(KURLAR).map(v => KURLAR[v].value),
    custom() {
      const satilabilir = this.field('satilabilir');
      if (satilabilir.isSet && satilabilir.value === true && !this.isSet) {
        return 'required';
      }
    },
  },
  notlar: {
    label: 'Notlar',
    type: String,
    optional: true,
    max: 500,
    autoValue() {
      if (this.isSet) {
        return this.value.toTrimmed();
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

Urunler.attachSchema(Urunler.Schema);

Urunler.vermongo({timestamps: true, userId: 'recordedBy'});

if (Meteor.isServer) {
  const collate = require('/imports/utils/server/collate').default;
  collate(Urunler, ['isim']);
}

const collatedSort = require('/imports/utils/collated-sort').default;
collatedSort(Urunler, ['isim']);

function helpers() {
  return {
    etiketLabels() {
      return Etiketler
        .find({_id: {$in: this.etiketler}}, {sort: {tip: 1, isim: 1}})
        .map(e => e.isim);
    },
    label() {
      return `${this.isim}${this.markaLabel ? ` (${this.markaLabel})` : ''}${this.barkod ? ` (${this.barkod})` : ''}`;
    },
    sinifLabel() {
      const sinif = Siniflar.findOne({_id: this.sinif});
      return sinif && sinif.label();
    },
    kdvLabel() {
      return Number.isInteger(this.kdv) ? this.kdv.toString().enumValueToLabel(KDVLER) : undefined
    },
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
    stokBakiyesi() {
      return Bakiye.Stok.find({urun: this._id}).fetch().reduce((adet,stok) => adet + stok.adet,0);
    },
    stokKonumBakiyesi(konum) {
      return Bakiye.Stok.find({urun: this._id, konum}).fetch().reduce((adet,stok) => adet + stok.adet,0);
    },
    fiyatLabel() {
      return Number.isInteger(this.fiyat) && this.fiyat.toCurrencyDisplay(2,this.kur);
    },
    fiyatLabelTL() {
      return Number.isInteger(this.fiyat) && (this.fiyat * Kurlar.findOne({tarih: Date.today()})[this.kur]).toCurrencyDisplay();
    },
    ozelFiyatLabel() {
      return Number.isInteger(this.ozelFiyat) && this.ozelFiyat.toCurrencyDisplay(2,this.kur);
    },
    ozelFiyatLabelTL() {
      return Number.isInteger(this.ozelFiyat) && (this.ozelFiyat * Kurlar.findOne({tarih: Date.today()})[this.kur]).toCurrencyDisplay();
    },
    bakiyeArray() {
      return Bakiye.Stok.find({urun: this._id, adet: {$ne: 0}}).map(b => ({
        konum: b.konum,
        adet: b.adet,
      }));
    },
    bakiyeAcilisArray() {
      return Bakiye.Stok.Acilis.find({urun: this._id, adet: {$ne: 0}}).map(b => ({
        konum: b.konum,
        adet: b.adet,
      }));
    },
  };
}

Urunler.helpers(helpers.apply(this));
Urunler.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Urunler.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Urunler.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.etiketler) references = references.concat(doc.etiketler);
    if (doc.sinif) references.push(doc.sinif);
    if (doc.marka) references.push(doc.marka);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.URUN.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references,
    });
  });

  Urunler.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Ürünün'];

    if (this.previous.isim !== doc.isim) {
      notes.push('ismi değiştirildi')
    }

    if (this.previous.barkod !== doc.barkod) {
      notes.push('barkodu değiştirildi')
    }

    if (this.previous.tip !== doc.tip) {
      notes.push('tipi değiştirildi')
    }

    if (this.previous.sinif !== doc.sinif) {
      notes.push('sınıfı değiştirildi')
    }

    if (this.previous.marka !== doc.marka) {
      notes.push('markası değiştirildi')
    }

    if (this.previous.markaLabel !== doc.markaLabel) {
      notes.push('markasının ismi değiştirildi')
    }

    if (this.previous.aktif && !doc.aktif) {
      notes.push('kullanımı donduruldu')
    }

    if (!this.previous.aktif && doc.aktif) {
      notes.push('kullanımı tekrar devreye alındı')
    }

    if (this.previous.gidereUygun !== doc.gidereUygun) {
      notes.push('sınıfından dolayı gidere uygunluğu değiştirildi')
    }

    if (this.previous.gelireUygun !== doc.gelireUygun) {
      notes.push('sınıfından dolayı gelire uygunluğu değiştirildi')
    }

    if (this.previous.satilabilir && !doc.satilabilir) {
      notes.push('satıştan kaldırıldı')
    }

    if (!this.previous.satilabilir && doc.satilabilir) {
      notes.push('satışa alındı')
    }

    if (this.previous.satilabilir && doc.satilabilir) {

      if (this.previous.stokTakipli && !doc.stokTakipli) {
        notes.push('stok takibinden çıkarıldı')
      }

      if (!this.previous.stokTakipli && doc.stokTakipli) {
        notes.push('stok takibine alındı')
      }

      if (!this.previous.kdv && doc.kdv) {
        notes.push('kdv oranı değişti')
      }

      if ( doc.fiyat !== this.previous.fiyat
      || doc.ozelFiyat !== this.previous.ozelFiyat
      || doc.kur !== this.previous.kur ) {
        notes.push('fiyatı değiştirildi')
      }

    }

    if ( (Array.isArray(this.previous.etiketler) !== Array.isArray(doc.etiketler)) ||
      (
        Array.isArray(this.previous.etiketler) && Array.isArray(doc.etiketler) &&
        this.previous.etiketler.sort().join('') !== doc.etiketler.sort().join('')
      ) ) {
      notes.push('etiketleri değiştirildi')
    }

    let references = [doc._id];
    if (this.previous.etiketler) references = references.concat(this.previous.etiketler);
    if (doc.etiketler) references = references.concat(doc.etiketler);
    if (this.previous.sinif) references.push(this.previous.sinif);
    if (doc.sinif) references.push(doc.sinif);
    if (this.previous.marka) references.push(this.previous.marka);
    if (doc.marka) references.push(doc.marka);
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.URUN.value,
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
