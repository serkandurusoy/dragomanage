import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import { StokTransferleri, Bakiye } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { bakiye } from './shared/bakiye';

export const stokTransferi = {

  insert: new ValidatedMethod({

    name: 'stokTransferi.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.URUNLER],

    validate: StokTransferleri.Schema.validator({clean: true}),

    run(doc) {

      if (doc.adet === 0) {
        throw new ValidationError([
          {
            name: 'adet',
            type: 'adetGirilmeli',
            value: 0,
          }
        ]);
      }

      const konumKaynak = Bakiye.Stok.findOne({konum: doc.konumKaynak, urun: doc.urun});

      if (!konumKaynak || konumKaynak.adet < doc.adet) {
        throw new ValidationError([
          {
            name: 'adet',
            type: 'yetersizStok',
            value: doc.adet,
          }
        ]);
      }

      const stokTransferi = StokTransferleri.insert(doc);

      bakiye.stok.azalt(doc.urun, doc.konumKaynak, doc.adet);
      bakiye.stok.artir(doc.urun, doc.konumHedef, doc.adet);

      return stokTransferi;

    },

  }),

  update: new ValidatedMethod({

    name: 'stokTransferi.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.URUNLER],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: new SimpleSchema([StokTransferleri.Schema, iptalOnayiSchema]),
      },
    }).validator({clean: true}),

    run({_id, doc: { iptalAciklamasi }}) {

      const previousStokTransferi = StokTransferleri.findOne(_id);
      const adet = previousStokTransferi.adet;
      const konumKaynak = Bakiye.Stok.findOne({konum: previousStokTransferi.konumHedef, urun: previousStokTransferi.urun});
      const konumHedef = Bakiye.Stok.findOne({konum: previousStokTransferi.konumKaynak, urun: previousStokTransferi.urun});

      if (!konumKaynak || konumKaynak.adet < adet) {
        throw new ValidationError([
          {
            name: 'adet',
            type: 'yetersizStok',
            value: previousStokTransferi.adet,
          }
        ]);
      }

      const doc = Object.assign({}, previousStokTransferi, {
        adet: 0,
        aciklama: `İptal nedeni: ${iptalAciklamasi}`,
      });

      const modifier = docToModifier(StokTransferleri.Schema, doc);

      const stokTransferi = StokTransferleri.update(_id, modifier);

      bakiye.stok.azalt(previousStokTransferi.urun, konumKaynak.konum, adet);
      bakiye.stok.artir(previousStokTransferi.urun, konumHedef.konum, adet);

      return stokTransferi;

    },

  }),

}

