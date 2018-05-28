import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import { Urunler, Bakiye } from '/imports/api/model';

export const urun = {

  fetch: new ValidatedMethod({

    name: 'urun.fetch',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.RAPOR_URUN],

    validate: new SimpleSchema({
      list:  {type:Array},
      'list.$':{type: String},
    }).validator({clean: true}),

    run({list}) {
      return Urunler.find({_id: {$in: list}}, {sort: {isim: 1}}).map(urun => ({
        _id: urun._id,
        marka: urun.markaLabel ? urun.markaLabel : '',
        isim: urun.isim ? urun.isim : '',
        barkod: urun.barkod ? urun.barkod : '',
        fiyat: urun.fiyat ? `${urun.fiyatLabel()} (%${urun.kdvLabel()}Kdv)` : '',
      }));
    }

  }),

  select: new ValidatedMethod({

    name: 'urun.select',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.PUBLIC],

    validate: new SimpleSchema({
      keyword: {
        type: String,
      },
      sadeceSatilabilirUrunler: {
        type: Boolean,
        optional: true,
      },
      sadeceStokTakipliUrunler: {
        type: Boolean,
        optional: true,
      },
      sadeceGelireUygunUrunler: {
        type: Boolean,
        optional: true,
      },
      sadeceGidereUygunUrunler: {
        type: Boolean,
        optional: true,
      },
      sadeceBarkodluUrunler: {
        type: Boolean,
        optional: true,
      },
    }).validator({clean: true}),

    run({
      keyword,
      sadeceSatilabilirUrunler,
      sadeceStokTakipliUrunler,
      sadeceGelireUygunUrunler,
      sadeceGidereUygunUrunler,
      sadeceBarkodluUrunler,
    }) {
      const selector = buildKeywordRegexSelector(keyword, ['isim', 'markaLabel', 'barkod'], {});
      if (sadeceSatilabilirUrunler) {
        selector.satilabilir= true;
      }
      if (sadeceStokTakipliUrunler) {
        selector.stokTakipli= true;
      }
      if (sadeceGelireUygunUrunler) {
        selector.gelireUygun= true;
      }
      if (sadeceGidereUygunUrunler) {
        selector.gidereUygun= true;
      }
      if (sadeceBarkodluUrunler) {
        selector.barkod= {$exists: true};
      }
      return Urunler.find(selector, {sort: {isim: 1}}).map(urun => ({
        value: urun._id,
        label: urun.label(),
      }));
    }

  }),

  insert: new ValidatedMethod({

    name: 'urun.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.URUNLER],

    validate: Urunler.Schema.validator({clean: true}),

    run(doc) {
      if (!this.isSimulation) {
        let selector = {
          $or: [
            { isim: doc.isim},
          ],
        };
        if (doc.barkod) {
          selector.$or = selector.$or.concat([{ barkod: doc.barkod}]);
        }
        const urun = Urunler.findOne(selector);
        if (urun) {
          throw new ValidationError([
            {
              name: urun.isim === doc.isim ? 'isim' : 'barkod',
              type: 'notUnique',
              value: urun.isim === doc.isim ? doc.isim : doc.barkod,
            }
          ]);
        }
      }

      if (doc.satilabilir === false) {
        delete doc.barkod;
        delete doc.stokTakipli;
        delete doc.stokUyariLimiti;
        delete doc.fiyat;
        delete doc.ozelFiyat;
        delete doc.kur;
      }

      return Urunler.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'urun.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.URUNLER],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Urunler.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (!this.isSimulation) {
        let selector = {
          $or: [
            { isim: doc.isim},
          ],
        };
        if (doc.barkod) {
          selector.$or = selector.$or.concat([{ barkod: doc.barkod}]);
        }
        selector._id = { $ne: _id };
        const urun = Urunler.findOne(selector);
        if (urun) {
          throw new ValidationError([
            {
              name: urun.isim === doc.isim ? 'isim' : 'barkod',
              type: 'notUnique',
              value: urun.isim === doc.isim ? doc.isim : doc.barkod,
            }
          ]);
        }

        const bakiye = Bakiye.Stok.findOne({urun: _id});
        const bakiyeVar = bakiye && bakiye.adet > 0;

        if (bakiyeVar) {
          const previousDoc = Urunler.findOne(_id);

          if (previousDoc.satilabilir && !doc.satilabilir) {
            throw new ValidationError([
              {
                name: 'satilabilir',
                type: 'stokVar',
                value: bakiye.adet,
              }
            ]);
          }

          if (previousDoc.satilabilir && doc.satilabilir && !doc.stokTakipli) {
            throw new ValidationError([
              {
                name: 'stokTakipli',
                type: 'stokVar',
                value: bakiye.adet,
              }
            ]);
          }

        }

      }

      const modifier = docToModifier(Urunler.Schema, doc);

      return Urunler.update(_id, modifier);

    },

  }),

}

