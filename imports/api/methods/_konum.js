import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Konumlar, Bakiye } from '/imports/api/model';

export const konum = {

  insert: new ValidatedMethod({

    name: 'konum.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: Konumlar.Schema.validator({clean: true}),

    run(doc) {

      if (Konumlar.findOne({
          tip: doc.tip,
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

      return Konumlar.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'konum.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Konumlar.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (Konumlar.findOne({
          tip: doc.tip,
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

      if (!doc.aktif && Bakiye.Stok.findOne({konum: _id, adet: {$ne: 0}})) {
        throw new ValidationError([
          {
            name: 'aktif',
            type: 'konumdaStokVar',
            value: false
          }
        ]);
      }

      const modifier = docToModifier(Konumlar.Schema, doc);

      return Konumlar.update(_id, modifier);

    },

  }),

}

