import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { YETKILER, ROLLER, COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';

export const Kullanicilar = new Mongo.Collection('users.kullanicilar');

Kullanicilar.Schema = new SimpleSchema({
  email: {
    label: 'Email',
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    index: 1,
    unique: true,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '').toLowerCase();
      }
    },
  },
  resim: {
    type: String,
    defaultValue: '/user.png',
  },
  ad: {
    label: 'Ad',
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
  soyad: {
    label: 'Soyad',
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
  yetkiler: {
    label: 'Yetkiler',
    type: Array,
    defaultValue: [],
  },
  'yetkiler.$': {
    label: 'Yetkiler',
    type: String,
    allowedValues: Object.keys(YETKILER)
      .map(v => YETKILER[v])
      .filter(v => !v.sistem)
      .map(v => v.value),
  },
  gizli: {
    label: 'Gizli',
    type: Boolean,
    index: 1,
    defaultValue: false,
  },
  rol: {
    label: 'Rol',
    type: String,
    defaultValue: ROLLER.NORMAL.value,
    allowedValues: Object.keys(ROLLER).map(v => ROLLER[v].value),
  },
});

Kullanicilar.selectOptions = (tip, updateForm) => {
  let selector = {};

  if (!updateForm) {
    selector.aktif = true;
    selector.gizli = false;
  }

  return Kullanicilar
    .find(selector, {sort: {ad: 1, soyad: 1}})
    .map(e => ({value: e._id, label: e.isim(), disabled: !e.aktif || e.gizli}));

};

Kullanicilar.attachSchema(Kullanicilar.Schema);

Kullanicilar.vermongo({timestamps: true, userId: 'recordedBy'});

if (Meteor.isServer) {
  const collate = require('/imports/utils/server/collate').default;
  collate(Kullanicilar, ['ad', 'soyad']);
}

const collatedSort = require('/imports/utils/collated-sort').default;
collatedSort(Kullanicilar, ['ad', 'soyad']);

function helpers() {
  return {
    isim() {
      return `${this.ad} ${this.soyad}`
    },
    user() {
      return Meteor.users.findOne({email: this.email});
    },
    adminVeyaPatron() {
      return [ROLLER.PATRON.value, ROLLER.ADMIN.value].includes(this.rol);
    },
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
  };
}

Kullanicilar.helpers(helpers.apply(this));
Kullanicilar.getVersionCollection().helpers(helpers.apply(this));

Meteor.users.helpers({
  kullanici() {
    return Kullanicilar.findOne({email: this.email});
  },
  yetkili(yetki) {
    const kullanici = this.kullanici();
    return kullanici.aktif
      && (
        kullanici.adminVeyaPatron()
          || yetki === YETKILER.PUBLIC.value
          || kullanici.yetkiler.includes(yetki)
      );
  },
  sadeceTalebeYetkili() {
    const kullanici = this.kullanici();
    return !kullanici.adminVeyaPatron() && kullanici.yetkiler.length === 1 && kullanici.yetkiler[0] === YETKILER.TALEPLER.value
  },
  hicYetkiliDegil() {
    const kullanici = this.kullanici();
    return !kullanici.adminVeyaPatron() && kullanici.yetkiler.length === 0
  },
});

if (Meteor.isServer) {
  Kullanicilar.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Kullanicilar.after.insert(function(userId, doc) {
    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.KULLANICI.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references: [doc._id],
    });
  });

  Kullanicilar.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Kullanıcının'];

    if (!userId) {
      notes.push('hesabına ilk defa giriş yapıldı')
    }

    if (this.previous.ad !== doc.ad || this.previous.soyad !== doc.soyad) {
      notes.push('ismi değiştirildi')
    }

    if (this.previous.aktif && !doc.aktif) {
      notes.push('hesabı donduruldu')
    }

    if (!this.previous.aktif && doc.aktif) {
      notes.push('hesabı tekrar devreye alındı')
    }

    if (this.previous.gizli && !doc.gizli) {
      notes.push('gizliliği değiştirildi')
    }

    if (this.previous.rol !== doc.rol) {
      notes.push('rolü değiştirildi')
    }

    if (this.previous.yetkiler.sort().join('') !== doc.yetkiler.sort().join('')) {
      notes.push('yetkileri değiştirildi')
    }

    if (this.previous.rol !== doc.rol && doc.rol !== ROLLER.NORMAL.value) {
      notes.push('yetki limitleri sınırsız hale geldi')
    }

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.KULLANICI.value,
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
