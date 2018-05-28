import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { KasaTransferleri, Bakiye } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { bakiye } from './shared/bakiye';

export const kasaTransferi = {

  insert: new ValidatedMethod({

    name: 'kasaTransferi.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: KasaTransferleri.Schema.validator({clean: true}),

    run(doc) {

      if (doc.tutarX100 === 0) {
        throw new ValidationError([
          {
            name: 'tutar',
            type: 'tutarGirilmeli',
            value: 0,
          }
        ]);
      }

      const kasaKaynak = Bakiye.Kasa.findOne({kasa: doc.kasaKaynak});

      if (!kasaKaynak || kasaKaynak.tutarX100 < doc.tutarX100) {
        throw new ValidationError([
          {
            name: 'tutar',
            type: 'yetersizBakiye',
            value: doc.tutar,
          }
        ]);
      }

      const kasaTransferi = KasaTransferleri.insert(doc);

      bakiye.kasa.azalt(doc.kasaKaynak, doc.tutarX100);
      bakiye.kasa.artir(doc.kasaHedef, doc.tutarX100);

      return kasaTransferi;

    },

  }),

  update: new ValidatedMethod({

    name: 'kasaTransferi.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: new SimpleSchema(KasaTransferleri.Schema).extend(iptalOnayiSchema),
      },
    }).validator({clean: true}),

    run({_id, doc: { iptalAciklamasi }}) {

      const previousKasaTransferi = KasaTransferleri.findOne(_id);
      const tutarX100 = previousKasaTransferi.tutarX100;
      const kasaKaynak = Bakiye.Kasa.findOne({kasa: previousKasaTransferi.kasaHedef});
      const kasaHedef = Bakiye.Kasa.findOne({kasa: previousKasaTransferi.kasaKaynak});

      if (!kasaKaynak || kasaKaynak.tutarX100 < tutarX100) {
        throw new ValidationError([
          {
            name: 'tutar',
            type: 'yetersizBakiye',
            value: previousKasaTransferi.tutar,
          }
        ]);
      }

      const doc = Object.assign({}, previousKasaTransferi, {
        tutar: 0,
        tutarKurus: 0,
        tutarX100: 0,
        tutarX100TL: 0,
        aciklama: `İptal nedeni: ${iptalAciklamasi}`,
      });

      const modifier = docToModifier(KasaTransferleri.Schema, doc);

      const kasaTransferi = KasaTransferleri.update(_id, modifier);

      bakiye.kasa.azalt(kasaKaynak.kasa, tutarX100);
      bakiye.kasa.artir(kasaHedef.kasa, tutarX100);

      return kasaTransferi;

    },

  }),

}

