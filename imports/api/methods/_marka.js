import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Markalar } from '/imports/api/model';

export const marka = {

  insert: new ValidatedMethod({

    name: 'marka.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.URUNLER],

    validate: Markalar.Schema.validator({clean: true}),

    run(doc) {

      if (Markalar.findOne({
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

      return Markalar.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'marka.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.URUNLER],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Markalar.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (Markalar.findOne({
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

      const modifier = docToModifier(Markalar.Schema, doc);

      return Markalar.update(_id, modifier);

    },

  }),

}

