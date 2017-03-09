import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Gelirler, Bakiye, CariKartlar, Urunler } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { bakiye } from './shared/bakiye';

export const gelir = {

  insert: new ValidatedMethod({

    name: 'gelir.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: Gelirler.Schema.validator({clean: true}),

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
      if (!this.isSimulation && !urun) {
        throw new ValidationError([
          {
            name: 'urun',
            type: 'notAllowed',
            value: doc.urun,
          }
        ]);
      }
      if (!this.isSimulation && !urun.aktif) {
        throw new ValidationError([
          {
            name: 'urun',
            type: 'hasInactiveValue',
            value: doc.urun,
          }
        ]);
      }
      if (!this.isSimulation && urun.gelireUygun && !urun.satilabilir) {
        throw new ValidationError([
          {
            name: 'urun',
            type: 'urunSatistaDegil',
            value: doc.urun,
          }
        ]);
      }

      if (!this.isSimulation && urun.stokTakipli && urun.stokKonumBakiyesi(doc.konum) < (doc.adet || 1)) {
        throw new ValidationError([
          {
            name: 'adet',
            type: 'yetersizStok',
            value: doc.adet,
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

      const gelir = Gelirler.insert(doc);

      bakiye.stok.azalt(doc.urun, doc.konum, doc.adet);
      bakiye.cari.azalt(doc.cariKart, doc.tutarX100TL);

      return gelir;

    },

  }),

  update: new ValidatedMethod({

    name: 'gelir.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: new SimpleSchema([Gelirler.Schema, iptalOnayiSchema]),
      },
    }).validator({clean: true}),

    run({_id, doc: { iptalAciklamasi }}) {

      const previousGelir = Gelirler.findOne(_id);

      const doc = Object.assign({}, previousGelir, {
        adet: 0,
        tutar: 0,
        tutarKurus: 0,
        tutarX100: 0,
        tutarX100TL: 0,
        aciklama: `İptal nedeni: ${iptalAciklamasi}`,
      });

      const modifier = docToModifier(Gelirler.Schema, doc);

      const gelir = Gelirler.update(_id, modifier);

      bakiye.stok.artir(previousGelir.urun, previousGelir.konum, previousGelir.adet);
      bakiye.cari.artir(previousGelir.cariKart, previousGelir.tutarX100TL);

      return gelir;

    },

  }),

}

