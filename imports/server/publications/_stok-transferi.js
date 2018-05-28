import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { StokTransferleri, Urunler } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('stokTransferi', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
  if (yetkili) {
    return [
      StokTransferleri.find(args._id),
      StokTransferleri.findOne(args._id).versions(),
      Urunler.find(StokTransferleri.find(args._id).urun),
    ];
  } else {
    this.ready();
  }
});

Meteor.publishComposite('stokTransferleri', function(args) {
  new SimpleSchema({
    selectorOptions: {
      type: Object,
    },
    'selectorOptions.urun': {
      type: String,
      optional: true,
    },
    'selectorOptions.konumKaynak': {
      type: String,
      optional: true,
    },
    'selectorOptions.konumHedef': {
      type: String,
      optional: true,
    },
    'selectorOptions.islemTarihiBegin': {
      type: Date,
      optional: true,
    },
    'selectorOptions.islemTarihiEnd': {
      type: Date,
      optional: true,
    },
    'selectorOptions.iptal': {
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
      const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
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

          if (typeof options.iptal === 'boolean') {
            let compare = {};
            if (options.iptal) {
              compare.$eq = 0;
            } else {
              compare.$gt = 0;
            }
            selector.$and.push({ adet: compare });
          }

          if (options.urun) {
            selector.$and.push({ urun: options.urun });
          }

          if (options.konumKaynak) {
            selector.$and.push({ konumKaynak: options.konumKaynak });
          }

          if (options.konumHedef) {
            selector.$and.push({ konumHedef: options.konumHedef });
          }

          if (options.islemTarihiBegin) {
            selector.$and.push({ islemTarihi: { $gte: options.islemTarihiBegin} });
          }

          if (options.islemTarihiEnd) {
            selector.$and.push({ islemTarihi: { $lte: options.islemTarihiEnd.add(1,'d')} });
          }

        }

        if (selector.$and && selector.$and.length === 0) {
          selector = {};
        }

        return StokTransferleri.find(selector, {
          sort: {islemTarihi: -1, urun: 1, createdAt: -1},
          limit: args.limit,
        });
      }
    },
    children: [
      {
        find(stokTransferi) {
          return Urunler.find(stokTransferi.urun);
        }
      }
    ]
  }

});
