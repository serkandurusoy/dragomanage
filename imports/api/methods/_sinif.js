import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Siniflar, Urunler } from '/imports/api/model';

export const sinif = {

  insert: new ValidatedMethod({

    name: 'sinift.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: Siniflar.Schema.validator({clean: true}),

    run(doc) {

      if (Siniflar.findOne({
          tip: doc.tip,
          ust: doc.ust,
          isim: doc.isim,
      })) {
        throw new ValidationError([
          {
            name: 'isim',
            type: 'notUnique',
            value: doc.isim
          }
        ]);
      }

      return Siniflar.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'sinif.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Siniflar.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (Siniflar.findOne({
          tip: doc.tip,
          ust: doc.ust,
          isim: doc.isim,
          _id: { $ne: _id },
        })) {
        throw new ValidationError([
          {
            name: 'isim',
            type: 'notUnique',
            value: doc.isim
          }
        ]);
      }

      if (!this.isSimulation) {
        const urun = Urunler.findOne({sinif: _id, satilabilir: true});

        if (urun) {
          const previousDoc = Siniflar.findOne(_id);

          if (previousDoc.gelir && !doc.gelir) {
            throw new ValidationError([
              {
                name: 'gelir',
                type: 'satistaUrunVar',
                value: urun.isim,
              }
            ]);
          }

        }
      }

      const modifier = docToModifier(Siniflar.Schema, doc);

      return Siniflar.update(_id, modifier);

    },

  }),

}

