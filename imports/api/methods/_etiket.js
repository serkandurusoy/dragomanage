import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Etiketler } from '/imports/api/model';

export const etiket = {

  insert: new ValidatedMethod({

    name: 'etiket.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: Etiketler.Schema.validator({clean: true}),

    run(doc) {

      if (Etiketler.findOne({
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

      return Etiketler.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'etiket.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TANIMLAR],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Etiketler.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (Etiketler.findOne({
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

      const modifier = docToModifier(Etiketler.Schema, doc);

      return Etiketler.update(_id, modifier);

    },

  }),

}

