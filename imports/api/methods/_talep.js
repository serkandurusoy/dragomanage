import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Talepler, CariKartlar, Urunler } from '/imports/api/model';
import { TALEPLER } from '/imports/environment/enums';

export const talep = {

  insert: new ValidatedMethod({

    name: 'talep.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.TALEPLER],

    validate: Talepler.Schema.validator({clean: true}),

    run(doc) {

      if (!this.isSimulation && !CariKartlar.findOne(doc.cariKart)) {
        throw new ValidationError([
          {
            name: 'cariKart',
            type: 'notAllowed',
            value: doc.cariKart,
          }
        ]);
      }

      const urun = Urunler.findOne(doc.urun);
      if (!this.isSimulation && [TALEPLER.GIDER.value, TALEPLER.GELIR.value].includes(doc.islem) && !urun) {
        throw new ValidationError([
          {
            name: 'urun',
            type: 'notAllowed',
            value: doc.urun,
          }
        ]);
      }

      if (doc.tutarX100 === 0) {
        throw new ValidationError([
          {
            name: 'tutar',
            type: 'tutarGirilmeli',
            value: 0,
          }
        ]);
      }

      return Talepler.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'talep.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: Talepler.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (!doc.islendi) {
        throw new ValidationError([
          {
            name: 'islendi',
            type: 'islendiIsartlenmeli',
            value: false,
          }
        ]);
      }

      const previousTalep = Talepler.findOne(_id);

      const newDoc = Object.assign({}, previousTalep, {
        reference: doc.reference,
        islendi: doc.islendi,
        aciklamaIslendi: doc.aciklamaIslendi,
      });

      const modifier = docToModifier(Talepler.Schema, newDoc);

      return Talepler.update(_id, modifier);

    },

  }),

}

