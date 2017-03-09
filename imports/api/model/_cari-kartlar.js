import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import IBAN from 'iban';
import { Etiketler } from './';
import { ETIKETLER, SEHIRLER, ULKELER, CARI_KARTLAR } from '/imports/environment/enums';
import { COLLECTIONS } from '/imports/environment/meta';
import { sahisBilgileri } from './shared/cari-kartlar-sahis-bilgileri';
import { Timeline } from './_timeline';
import { Bakiye } from './';

export const CariKartlar = new Mongo.Collection('cariKartlar');

CariKartlar.Schema = new SimpleSchema({
  tip: {
    label: 'Tip',
    type: String,
    index: 1,
    allowedValues: Object.keys(CARI_KARTLAR).map(v => CARI_KARTLAR[v].value),
  },
  etiketler: {
    label: 'Etiketler',
    type: [String],
    index: 1,
    autoValue() {
      if (!this.isSet || this.value === null) {
        return [];
      }
    },
    custom() {
      if (this.isSet && Etiketler.findOne({_id: {$in: this.value}, tip: ETIKETLER.CARI_KART.value, aktif: false})) {
        return 'hasInactiveValue'
      }
    },
  },
  'etiketler.$': {
    label: 'Etiketler',
    type: String,
    custom() {
      if (this.isSet && !Etiketler.findOne({_id: this.value, tip: ETIKETLER.CARI_KART.value})) {
        return 'notAllowed';
      }
    },
  },
  kisaIsim: {
    label: 'Kısa isim',
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
  unvan: {
    label: 'Ünvan',
    type: String,
    optional: true,
    index: 1,
    unique: true,
    sparse: true,
    min: 2,
    max: 100,
    autoValue() {
      if (this.isSet) {
        return this.value.toTitleCase();
      }
    },
  },
  email: {
    label: 'Email',
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '').toLowerCase();
      }
    },
  },
  telefon: {
    label: 'Telefon',
    type: String,
    optional: true,
    min: 10,
    max: 16,
    regEx: /^\d{10,16}$/,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '').replace(/\D+/g, '');
      }
    },
  },
  webSitesi: {
    label: 'Web sitesi',
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Url,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '').toLowerCase();
      }
    },
  },
  adres: {
    label: 'Adres',
    type: String,
    optional: true,
    min: 2,
    max: 200,
    autoValue() {
      if (this.isSet) {
        return this.value.toTrimmed();
      }
    },
  },
  sehir: {
    label: 'Şehir',
    type: String,
    optional: true,
    allowedValues: Object.keys(SEHIRLER).map(v => SEHIRLER[v].value),
  },
  ulke: {
    label: 'Ülke',
    type: String,
    optional: true,
    allowedValues: Object.keys(ULKELER).map(v => ULKELER[v].value),
  },
  vergiDairesi: {
    label: 'Vergi dairesi',
    type: String,
    optional: true,
    min: 2,
    max: 25,
    autoValue() {
      if (this.isSet) {
        return this.value.toTitleCase();
      }
    },
  },
  vergiNumarasi: {
    label: 'Vergi numarası',
    type: String,
    optional: true,
    min: 8,
    max: 16,
    regEx: /^\d{8,16}$/,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '');
      }
    },
  },
  iban: {
    label: 'IBAN',
    type: String,
    optional: true,
    autoValue() {
      if (this.isSet) {
        if (this.value.length === 0) {
          this.unset();
        } else {
          return this.value.replace(/\s+/g, '');
        }
      }
    },
    custom() {
      if (this.isSet) {
        if (!IBAN.isValid(this.value.replace(/\s+/g, ''))) {
          return 'badFormat';
        }
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
  sahisBilgileri: {
    label: 'Şahıs bilgileri',
    optional: true,
    type: sahisBilgileri,
  },
});

CariKartlar.attachSchema(CariKartlar.Schema);

CariKartlar.vermongo({timestamps: true, userId: 'recordedBy'});

if (Meteor.isServer) {
  const collate = require('/imports/utils/server/collate').default;
  collate(CariKartlar, ['kisaIsim', 'unvan']);
}

const collatedSort = require('/imports/utils/collated-sort').default;
collatedSort(CariKartlar, ['kisaIsim', 'unvan']);

function helpers() {
  return {
    etiketLabels() {
      return Etiketler
        .find({_id: {$in: this.etiketler}}, {sort: {tip: 1, isim: 1}})
        .map(e => e.isim);
    },
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
    bakiyeLabelTL() {
      const bakiye = Bakiye.Cari.findOne({cariKart: this._id, tutarX100TL: {$ne: 0}});
      return ((!bakiye ? 0 : bakiye.tutarX100TL) / 100 ).toCurrencyDisplay();
    },
    bakiyeAcilisLabelTL() {
      const bakiye = Bakiye.Cari.Acilis.findOne({cariKart: this._id, tutarX100TL: {$ne: 0}});
      return ((!bakiye ? 0 : bakiye.tutarX100TL) / 100 ).toCurrencyDisplay();
    },
  };
}

CariKartlar.helpers(helpers.apply(this));
CariKartlar.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  CariKartlar.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  CariKartlar.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.etiketler) references = references.concat(doc.etiketler);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.CARI_KART.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references,
    });
  });

  CariKartlar.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Cari kartın'];

    if (this.previous.kisaIsim !== doc.kisaIsim) {
      notes.push('kısa ismi değiştirildi')
    }

    if (this.previous.unvan !== doc.unvan) {
      notes.push('ünvanı değiştirildi')
    }

    if (this.previous.tip !== doc.tip) {
      notes.push('tipi değiştirildi')
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
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.CARI_KART.value,
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
