import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { SINIFLAR } from '/imports/environment/enums';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';
import { Urunler } from './';

export const Siniflar = new Mongo.Collection('siniflar');

Siniflar.Schema = new SimpleSchema({
  tip: {
    label: 'Tip',
    type: String,
    index: 1,
    allowedValues: Object.keys(SINIFLAR).map(v => SINIFLAR[v].value),
    autoValue() {
      if (this.isUpdate && this.isSet) {
        this.unset();
      }
    },
  },
  ust: {
    label: 'Üst',
    type: String,
    index: 1,
    optional: true,
    autoValue() {
      const tip = this.field('tip');
      if (tip.isSet && tip.value === SINIFLAR.IS.value) {
        this.unset();
      }
    },
    custom() {
      const tip = this.field('tip');
      if (tip.isSet && this.isSet) {
        if (tip.value === SINIFLAR.GRUP.value) {
          if (!Siniflar.findOne({tip: SINIFLAR.IS.value, _id: this.value})) {
            return 'notAllowed';
          }
        }
        if (tip.value === SINIFLAR.SINIF.value) {
          if (!Siniflar.findOne({tip: SINIFLAR.GRUP.value, _id: this.value})) {
            return 'notAllowed';
          }
        }
      }
    }
  },
  ustLabel: {
    type: String,
    optional: true,
    index: 1,
    autoValue() {
      const ust = this.field('ust');
      if (ust.isSet && ust.value) {
        const ustSinif = Siniflar.findOne(ust.value);
        const ustSinifLabel = ustSinif && ustSinif.label();
        return ustSinifLabel;
      } else {
        this.unset();
      }
    }
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
  gelir: {
    type: Boolean,
    optional: true,
    index: 1,
    autoValue() {
      const tip = this.field('tip');
      if (tip.isSet && tip.value === SINIFLAR.SINIF.value && !this.isSet) {
        return false;
      }
      if (tip.isSet && tip.value !== SINIFLAR.SINIF.value) {
        this.unset();
      }
    },
  },
  gider: {
    type: Boolean,
    optional: true,
    index: 1,
    autoValue() {
      const tip = this.field('tip');
      if (tip.isSet && tip.value === SINIFLAR.SINIF.value && !this.isSet) {
        return false;
      }
      if (tip.isSet && tip.value !== SINIFLAR.SINIF.value) {
        this.unset();
      }
    },
    custom() {
      const tip = this.field('tip');
      const gelir = this.field('gelir');
      if (tip.isSet && tip.value === SINIFLAR.SINIF.value) {
        if (this.isSet && gelir.isSet && this.value === false && gelir.value === false) {
          return 'gelirGiderBelirtilmeli';
        }
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

Siniflar.selectOptions = (tip, updateForm) => {

  let selector = {};
  if (!updateForm) {
    selector.aktif = true;
  }
  const options = {sort: {isim: 1}};

  if (tip === SINIFLAR.IS.value) {
    const isler = [];
    Siniflar.find({...selector, tip: SINIFLAR.IS.value}, options).forEach(is => {
      isler.push({
        value: is._id,
        label: `${is.isim}`,
        disabled: !(is.aktif)
      });
    });
    return isler;
  }

  if (tip === SINIFLAR.GRUP.value) {
    const gruplar = [];
    Siniflar.find({...selector, tip: SINIFLAR.IS.value}, options).forEach(is => {
      Siniflar.find({...selector, tip: SINIFLAR.GRUP.value, ust: is._id}, options).forEach(grup => {
        gruplar.push({
          value: grup._id,
          label: `${is.isim} / ${grup.isim}`,
          disabled: !(is.aktif && grup.aktif)
        });
      })
    });
    return gruplar;
  }

  if (tip === SINIFLAR.SINIF.value) {
    const siniflar = [];
    Siniflar.find({...selector, tip: SINIFLAR.IS.value}, options).forEach(is => {
      Siniflar.find({...selector, tip: SINIFLAR.GRUP.value, ust: is._id}, options).forEach(grup => {
        Siniflar.find({...selector, tip: SINIFLAR.SINIF.value, ust: grup._id}, options).forEach(sinif => {
          siniflar.push({
            value: sinif._id,
            label: `${is.isim} / ${grup.isim} / ${sinif.isim}`,
            disabled: !(is.aktif && grup.aktif && sinif.aktif)
          });
        })
      })
    });
    return siniflar;
  }

};

Siniflar.attachSchema(Siniflar.Schema);

Siniflar.vermongo({timestamps: true, userId: 'recordedBy'});

if (Meteor.isServer) {
  const collate = require('/imports/utils/server/collate').default;
  collate(Siniflar, ['ustLabel','isim'], 100);
}

const collatedSort = require('/imports/utils/collated-sort').default;
collatedSort(Siniflar, ['ustLabel','isim']);

function helpers() {
  return {
    label() {
      switch (this.tip) {
        case SINIFLAR.IS.value:
          return Siniflar
            .selectOptions(SINIFLAR.IS.value, true)
            .find(s => s.value === this._id)
            .label;
        case SINIFLAR.GRUP.value:
          return Siniflar
            .selectOptions(SINIFLAR.GRUP.value, true)
            .find(s => s.value === this._id)
            .label;
        case SINIFLAR.SINIF.value:
          return Siniflar
            .selectOptions(SINIFLAR.SINIF.value, true)
            .find(s => s.value === this._id)
            .label;
        default:
          return undefined;
      }
    },
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
  };
}

Siniflar.helpers(helpers.apply(this));
Siniflar.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Siniflar.rawCollection().createIndex({ tip: 1, ust: 1, isim: 1 }, { unique: true });
  Siniflar.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Siniflar.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.ust) references.push(doc.ust);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.SINIF.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.createdAt.daysApartFromNow(),
      references,
    });
  });

  Siniflar.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Sınıfın'];

    if (this.previous.isim !== doc.isim) {
      notes.push('ismi değiştirildi')
    }

    if (doc.ust && this.previous.ust !== doc.ust) {
      notes.push(`${doc.tip === SINIFLAR.GRUP.value ? 'işi' : 'grubu'} değiştirildi`)
    }

    if (doc.ust && this.previous.ustLabel !== doc.ustLabel) {
      notes.push(`${doc.tip === SINIFLAR.GRUP.value ? 'işinin' : 'grubunun'} ismi değiştirildi`)
    }

    if (this.previous.gelir !== doc.gelir || this.previous.gider !== doc.gider) {
      notes.push('gelir/gider özelliği değiştirildi')
    }

    if (this.previous.aktif && !doc.aktif) {
      notes.push('kullanımı donduruldu')
    }

    if (!this.previous.aktif && doc.aktif) {
      notes.push('kullanımı tekrar devreye alındı')
    }

    let references = [doc._id];
    if (this.previous.ust) references.push(this.previous.ust);
    if (doc.ust) references.push(doc.ust);
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.SINIF.value,
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

  Siniflar.after.update(function(userId, doc, fieldNames, modifier, options) {
    if (this.previous.isim !== doc.isim) {
      Siniflar.find({ust: doc._id})
        .forEach(sinif => Siniflar.update(sinif._id, {$set:{
          tip: sinif.tip,
          ust: sinif.ust,
          isim: sinif.isim,
          gelir: sinif.gelir,
          gider: sinif.gider,
          aktif: sinif.aktif,
        }}))
    }
  }, {fetchPrevious: true});

  Siniflar.after.update(function(userId, doc, fieldNames, modifier, options) {
    if (!this.previous.gelir && doc.gelir) {
      Urunler.find({sinif: doc._id})
        .forEach(urun => Urunler.update(urun._id, {$set:{
          gelireUygun: true,
        }}))
    }
    if (this.previous.gelir && !doc.gelir) {
      Urunler.find({sinif: doc._id, satilabilir: false})
        .forEach(urun => Urunler.update(urun._id, {$set:{
          gelireUygun: false,
        }}))
    }
    if (this.previous.gider !== doc.gider) {
      Urunler.find({sinif: doc._id})
        .forEach(urun => Urunler.update(urun._id, {$set:{
          gidereUygun: doc.gider,
        }}))
    }
  }, {fetchPrevious: true});

}
