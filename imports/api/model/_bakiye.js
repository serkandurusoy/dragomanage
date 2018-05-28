import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';

export const Bakiye = {
  Stok: new Mongo.Collection('bakiye.stok'),
  Kasa: new Mongo.Collection('bakiye.kasa'),
  Cari: new Mongo.Collection('bakiye.cari'),
};

Bakiye.Stok.Schema = new SimpleSchema({
  urun: {
    type: String,
    index: 1,
  },
  konum: {
    type: String,
    index: 1,
  },
  adet: {
    type: Number,
    optional: true,
    index: 1,
  },
});
Bakiye.Stok.attachSchema(Bakiye.Stok.Schema);
Bakiye.Stok.Acilis = new Mongo.Collection('bakiye.stok.acilis');
Bakiye.Stok.Acilis.attachSchema(Bakiye.Stok.Schema);

Bakiye.Kasa.Schema = new SimpleSchema({
  kasa: {
    type: String,
    index: 1,
  },
  tutarX100: {
    type: Number,
    optional: true,
    index: 1,
  },
});
Bakiye.Kasa.attachSchema(Bakiye.Kasa.Schema);
Bakiye.Kasa.Acilis = new Mongo.Collection('bakiye.kasa.acilis');
Bakiye.Kasa.Acilis.attachSchema(Bakiye.Kasa.Schema);

Bakiye.Cari.Schema = new SimpleSchema({
  cariKart: {
    type: String,
    index: 1,
  },
  tutarX100TL: {
    type: Number,
    optional: true,
    index: 1,
  },
});
Bakiye.Cari.attachSchema(Bakiye.Cari.Schema);
Bakiye.Cari.Acilis = new Mongo.Collection('bakiye.cari.acilis');
Bakiye.Cari.Acilis.attachSchema(Bakiye.Cari.Schema);
