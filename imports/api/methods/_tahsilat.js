import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Tahsilatlar, Bakiye, CariKartlar } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { bakiye } from './shared/bakiye';

export const tahsilat = {

  insert: new ValidatedMethod({

    name: 'tahsilat.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: Tahsilatlar.Schema.validator({clean: true}),

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

      const tahsilat = Tahsilatlar.insert(doc);

      bakiye.kasa.artir(doc.kasa, doc.tutarX100);
      bakiye.cari.artir(doc.cariKart, doc.tutarX100TL);

      return tahsilat;

    },

  }),

  update: new ValidatedMethod({

    name: 'tahsilat.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: new SimpleSchema([Tahsilatlar.Schema, iptalOnayiSchema]),
      },
    }).validator({clean: true}),

    run({_id, doc: { iptalAciklamasi }}) {

      const previousTahsilat = Tahsilatlar.findOne(_id);
      const previousKasa = Bakiye.Kasa.findOne({kasa: previousTahsilat.kasa});

      if (!previousKasa || previousKasa.tutarX100 < previousTahsilat.tutarX100) {
        throw new ValidationError([
          {
            name: 'tutar',
            type: 'yetersizBakiye',
            value: previousTahsilat.tutar,
          }
        ]);
      }

      const doc = Object.assign({}, previousTahsilat, {
        tutar: 0,
        tutarKurus: 0,
        tutarX100: 0,
        tutarX100TL: 0,
        aciklama: `İptal nedeni: ${iptalAciklamasi}`,
      });

      const modifier = docToModifier(Tahsilatlar.Schema, doc);

      const tahsilat = Tahsilatlar.update(_id, modifier);

      bakiye.kasa.azalt(previousTahsilat.kasa, previousTahsilat.tutarX100);
      bakiye.cari.azalt(previousTahsilat.cariKart, previousTahsilat.tutarX100TL);

      return tahsilat;

    },

  }),

}

