import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Kullanicilar } from '/imports/api/model';

export const kullanici = {

  insert: new ValidatedMethod({

    name: 'kullanici.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.SECRET],

    validate: Kullanicilar.Schema.validator({clean: true}),

    run(doc) {

      if (Kullanicilar.findOne({email: doc.email})) {
        throw new ValidationError([
          {
            name: 'email',
            type: 'notUnique',
            value: doc.email
          }
        ]);
      }

      return Kullanicilar.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'kullanici.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.SECRET],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Kullanicilar.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (Kullanicilar.findOne({email: doc.email, _id: { $ne: _id }})) {
        throw new ValidationError([
          {
            name: 'email',
            type: 'notUnique',
            value: doc.email
          }
        ]);
      }

      const modifier = docToModifier(Kullanicilar.Schema, doc);

      return Kullanicilar.update(_id, modifier);

    },

  }),

}
