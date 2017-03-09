import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Odemeler, Bakiye, CariKartlar } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { bakiye } from './shared/bakiye';

export const odeme = {

  insert: new ValidatedMethod({

    name: 'odeme.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: Odemeler.Schema.validator({clean: true}),

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

      if (doc.tutarX100 === 0) {
        throw new ValidationError([
          {
            name: 'tutar',
            type: 'tutarGirilmeli',
            value: 0,
          }
        ]);
      }

      const kasa = Bakiye.Kasa.findOne({kasa: doc.kasa});
      if (!kasa || kasa.tutarX100 < doc.tutarX100) {
        throw new ValidationError([
          {
            name: 'tutar',
            type: 'yetersizBakiye',
            value: doc.tutar,
          }
        ]);
      }

      const odeme = Odemeler.insert(doc);

      bakiye.kasa.azalt(doc.kasa, doc.tutarX100);
      bakiye.cari.azalt(doc.cariKart, doc.tutarX100TL);

      return odeme;

    },

  }),

  update: new ValidatedMethod({

    name: 'odeme.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: new SimpleSchema([Odemeler.Schema, iptalOnayiSchema]),
      },
    }).validator({clean: true}),

    run({_id, doc: { iptalAciklamasi }}) {

      const previousOdeme = Odemeler.findOne(_id);

      const doc = Object.assign({}, previousOdeme, {
        tutar: 0,
        tutarKurus: 0,
        tutarX100: 0,
        tutarX100TL: 0,
        aciklama: `İptal nedeni: ${iptalAciklamasi}`,
      });

      const modifier = docToModifier(Odemeler.Schema, doc);

      const odeme = Odemeler.update(_id, modifier);

      bakiye.kasa.artir(previousOdeme.kasa, previousOdeme.tutarX100);
      bakiye.cari.artir(previousOdeme.cariKart, previousOdeme.tutarX100TL);

      return odeme;

    },

  }),

}

