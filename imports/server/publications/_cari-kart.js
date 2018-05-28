import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { CariKartlar, Bakiye } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';

Meteor.publish('cariKart', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.CARI_KARTLAR.value);
  if (yetkili) {
    return [
      CariKartlar.find(args._id),
      CariKartlar.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

const filterSchema = new SimpleSchema({
  selectorOptions: {
    type: Object,
  },
  'selectorOptions.keyword': {
    type: String,
    optional: true,
  },
  'selectorOptions.tip': {
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
  let selector = buildKeywordRegexSelector(args.selectorOptions.keyword, ['unvan', 'kisaIsim'], {});

  if (args.selectorOptions.etiketler && args.selectorOptions.etiketler.length > 0) {
    selector.etiketler = {
      $in: args.selectorOptions.etiketler,
    }
  }

  if (args.selectorOptions.tip && args.selectorOptions.tip.length > 0) {
    selector.tip = args.selectorOptions.tip;
  }

  return selector;
}

const fields = {
  tip: 1,
  etiketler: 1,
  kisaIsim: 1,
  unvan: 1,
};

Meteor.publish('cariKartlar', function(args) {
  filterSchema.validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.CARI_KARTLAR.value);
  if (yetkili) {

    let selector = buildSelector(args);

    return [
      CariKartlar.find(selector, {
        sort: {kisaIsim: 1},
        limit: args.limit,
        fields: Object.assign({}, fields, {
          email: 1,
          telefon: 1,
        }),
      }),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('cariBakiyeler', function(args) {
  filterSchema.validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.RAPOR_MUHASEBE.value);
  if (yetkili) {

    let selector = buildSelector(args);

    selector._id = {
      $in: Bakiye.Cari.find({tutarX100TL: {$ne: 0}}, {fields: {cariKart: 1}}).map(b => b.cariKart),
    };

    return [
      CariKartlar.find(selector, {
        sort: {kisaIsim: 1},
        limit: args.limit,
        fields
      }),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('cariAcilisBakiyeler', function(args) {
  filterSchema.validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.RAPOR_MUHASEBE.value);
  if (yetkili) {

    let selector = buildSelector(args);

    selector._id = {
      $in: Bakiye.Cari.Acilis.find({tutarX100TL: {$ne: 0}}, {fields: {cariKart: 1}}).map(b => b.cariKart),
    };

    return [
      CariKartlar.find(selector, {
        sort: {kisaIsim: 1},
        limit: args.limit,
        fields
      }),
    ];
  } else {
    this.ready();
  }
});
