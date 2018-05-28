import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Urunler, Bakiye } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';

Meteor.publish('gelirGiderUrunu', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
      optional: true
    },
  }).validate(args);
  this.unblock();
  if(args._id) {
    const yetkili = this.userId && ( Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value) || Meteor.users.findOne(this.userId).yetkili(YETKILER.RAPOR_URUN.value) );
    if (yetkili) {
      return [
        Urunler.find(args._id),
      ];
    } else {
      this.ready();
    }
  } else {
    this.ready();
  }
});

Meteor.publish('urun', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.URUNLER.value);
  if (yetkili) {
    return [
      Urunler.find(args._id),
      Urunler.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

const filterSchema = new SimpleSchema({
  selectorOptions: {
    type: Object,
    blackbox: true,
  },
  'selectorOptions.keyword': {
    type: String,
    optional: true,
  },
  'selectorOptions.tip': {
    type: String,
    optional: true,
  },
  'selectorOptions.sinif': {
    type: String,
    optional: true,
  },
  'selectorOptions.etiketler': {
    type: Array,
    optional: true,
  },
  'selectorOptions.etiketler.$': {
    type: String,
  },
  limit: {
    type: Number,
  },
});

function buildSelector(args) {
  let selector = buildKeywordRegexSelector(args.selectorOptions.keyword, ['isim', 'markaLabel', 'barkod'], {});

  if (args.selectorOptions.etiketler && args.selectorOptions.etiketler.length > 0) {
    selector.etiketler = {
      $in: args.selectorOptions.etiketler,
    }
  }

  if (args.selectorOptions.tip && args.selectorOptions.tip.length > 0) {
    selector.tip = args.selectorOptions.tip;
  }

  if (args.selectorOptions.sinif && args.selectorOptions.sinif.length > 0) {
    selector.sinif = args.selectorOptions.sinif;
  }

  return selector;

}

const fields = {
  etiketler: 1,
  isim: 1,
  marka: 1,
  markaLabel: 1,
  barkod: 1,
  tip: 1,
  sinif: 1,
}

Meteor.publish('urunler', function(args) {
  new SimpleSchema(new SimpleSchema(filterSchema).extend(new SimpleSchema({
    selectorOptions: {
      type: Object,
      blackbox: true,
    },
    'selectorOptions.satilabilir': {
      type: Boolean,
      optional: true,

    },
  }))).validate(args);

  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.URUNLER.value);
  if (yetkili) {

    let selector = buildSelector(args);

    return [
      Urunler.find(selector, {
        sort: {isim: 1},
        limit: args.limit,
        fields: Object.assign({}, fields, {
          satilabilir: 1,
          aktif: 1,
        })
      }),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('fiyatListesi', function(args) {
  filterSchema.validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {

    let selector = buildSelector(args);

    selector.satilabilir = true;
    selector.aktif = true;

    return [
      Urunler.find(selector, {
        sort: {isim: 1},
        limit: args.limit,
        fields: Object.assign({}, fields, {
          fiyat: 1,
          ozelFiyat: 1,
          kur: 1,
        })
      }),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('stokBakiyeleri', function(args) {
  filterSchema.validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.RAPOR_URUN.value);
  if (yetkili) {

    let selector = buildSelector(args);

    selector._id = {
      $in: Bakiye.Stok.find({adet: {$ne: 0}}, {fields: {urun: 1}}).map(b => b.urun),
    };

    return [
      Urunler.find(selector, {
        sort: {isim: 1},
        limit: args.limit,
        fields
      }),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('stokAcilisBakiyeleri', function(args) {
  filterSchema.validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.RAPOR_URUN.value);
  if (yetkili) {

    let selector = buildSelector(args);

    selector._id = {
      $in: Bakiye.Stok.Acilis.find({adet: {$ne: 0}}, {fields: {urun: 1}}).map(b => b.urun),
    };

    return [
      Urunler.find(selector, {
        sort: {isim: 1},
        limit: args.limit,
        fields
      }),
    ];
  } else {
    this.ready();
  }
});
