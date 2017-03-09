import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { Giderler, Bakiye, CariKartlar, Urunler } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { bakiye } from './shared/bakiye';

export const gider = {

  insert: new ValidatedMethod({

    name: 'gider.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: Giderler.Schema.validator({clean: true}),

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
      if (!this.isSimulation && !urun.gidereUygun) {
        throw new ValidationError([
          {
            name: 'urun',
            type: 'urunGiderDegil',
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

      const gider = Giderler.insert(doc);

      bakiye.stok.artir(doc.urun, doc.konum, doc.adet);
      bakiye.cari.artir(doc.cariKart, doc.tutarX100TL);

      return gider;

    },

  }),

  update: new ValidatedMethod({

    name: 'gider.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.MUHASEBE],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: new SimpleSchema([Giderler.Schema, iptalOnayiSchema]),
      },
    }).validator({clean: true}),

    run({_id, doc: { iptalAciklamasi }}) {

      const previousGider = Giderler.findOne(_id);
      const urun = Urunler.findOne(previousGider.urun);

      if (!this.isSimulation && urun.stokTakipli && urun.stokKonumBakiyesi(previousGider.konum) < previousGider.adet) {
        throw new ValidationError([
          {
            name: 'adet',
            type: 'yetersizStok',
            value: previousGider.adet,
          }
        ]);
      }

      const doc = Object.assign({}, previousGider, {
        adet: 0,
        tutar: 0,
        tutarKurus: 0,
        tutarX100: 0,
        tutarX100TL: 0,
        aciklama: `İptal nedeni: ${iptalAciklamasi}`,
      });

      const modifier = docToModifier(Giderler.Schema, doc);

      const gider = Giderler.update(_id, modifier);

      bakiye.stok.azalt(previousGider.urun, previousGider.konum, previousGider.adet);
      bakiye.cari.azalt(previousGider.cariKart, previousGider.tutarX100TL);

      return gider;

    },

  }),

}

