import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { KasaTransferleri } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('kasaTransferi', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
  if (yetkili) {
    return [
      KasaTransferleri.find(args._id),
      KasaTransferleri.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

Meteor.publishComposite('kasaTransferleri', function(args) {
  new SimpleSchema({
    selectorOptions: {
      type: Object,
    },
    'selectorOptions.kasaKaynak': {
      type: String,
      optional: true,
    },
    'selectorOptions.kasaHedef': {
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
            selector.$and.push({ tutarX100: compare });
          }

          if (options.kasaKaynak) {
            selector.$and.push({ kasaKaynak: options.kasaKaynak });
          }

          if (options.kasaHedef) {
            selector.$and.push({ kasaHedef: options.kasaHedef });
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

        return KasaTransferleri.find(selector, {
          sort: {islemTarihi: -1, createdAt: -1},
          limit: args.limit,
        });
      }
    },
  }

});
