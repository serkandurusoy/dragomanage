import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Talepler, CariKartlar, Urunler } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('talep', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.TALEPLER.value);
  if (yetkili) {
    const talep = Talepler.findOne(args._id);
    let publications = [
      Talepler.find(args._id),
      talep.versions(),
    ];
    if (talep.cariKart) {
      publications.push(CariKartlar.find(talep.cariKart));
    }
    if (talep.urun) {
      publications.push(Urunler.find(talep.urun));
    }
    return publications;
  } else {
    this.ready();
  }
});

Meteor.publishComposite('talepler', function(args) {
  new SimpleSchema({
    selectorOptions: {
      type: Object,
    },
    'selectorOptions.cariKart': {
      type: String,
      optional: true,
    },
    'selectorOptions.urun': {
      type: String,
      optional: true,
    },
    'selectorOptions.islem': {
      type: String,
      optional: true,
    },
    'selectorOptions.kaydeden': {
      type: String,
      optional: true,
    },
    'selectorOptions.createdAtBegin': {
      type: Date,
      optional: true,
    },
    'selectorOptions.createdAtEnd': {
      type: Date,
      optional: true,
    },
    'selectorOptions.reference': {
      type: String,
      optional: true,
    },
    'selectorOptions.islendi': {
      type: Boolean,
      optional: true,
    },
    limit: {
      type: Number,
    },
  }).validate(args);
  this.unblock();

  return {
    find() {
      const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.TALEPLER.value);
      if (yetkili) {

        let selector = {};
        let options = args.selectorOptions;
        Object.keys(args.selectorOptions).forEach(o => (
            typeof options[o] === 'undefined' ||
            options[o] === ''
          ) && delete options[o]
        );

        if (Object.keys(options).length > 0) {
          selector.$and = [];

          if (typeof options.islendi === 'boolean') {
            selector.$and.push({ islendi: options.islendi });
          }

          if (options.islem) {
            selector.$and.push({ islem: options.islem });
          }

          if (options.cariKart) {
            selector.$and.push({ cariKart: options.cariKart });
          }

          if (options.urun) {
            selector.$and.push({ urun: options.urun });
          }

          if (options.reference) {
            selector.$and.push({ reference: options.reference });
          }

          if (options.kaydeden) {
            selector.$and.push({ kaydeden: options.kaydeden });
          }

          if (options.createdAtBegin) {
            selector.$and.push({ createdAt: { $gte: options.createdAtBegin} });
          }

          if (options.createdAtEnd) {
            selector.$and.push({ createdAt: { $lte: options.createdAtEnd.add(1,'d')} });
          }

        }

        if (selector.$and && selector.$and.length === 0) {
          selector = {};
        }

        return Talepler.find(selector, {
          sort: {createdAt: -1},
          limit: args.limit,
        });
      }
    },
    children: [
      {
        find(talep) {
          return CariKartlar.find(talep.cariKart);
        }
      },
      {
        find(talep) {
          return Urunler.find(talep.urun);
        }
      },
    ]
  }

});
