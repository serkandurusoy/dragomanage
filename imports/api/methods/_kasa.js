import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Kasalar, Bakiye } from '/imports/api/model';

export const kasa = {

  insert: new ValidatedMethod({

    name: 'kasa.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: Kasalar.Schema.validator({clean: true}),

    run(doc) {

      if (Kasalar.findOne({
          tip: doc.tip,
          kur: doc.kur,
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

      return Kasalar.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'kasa.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Kasalar.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (Kasalar.findOne({
          tip: doc.tip,
          kur: doc.kur,
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

      if (!doc.aktif && Bakiye.Kasa.findOne({kasa: _id, tutarX100: {$ne: 0}})) {
        throw new ValidationError([
          {
            name: 'aktif',
            type: 'kasadaParaVar',
            value: false
          }
        ]);
      }

      const modifier = docToModifier(Kasalar.Schema, doc);

      return Kasalar.update(_id, modifier);

    },

  }),

}

