import { Bakiye, Urunler } from '/imports/api/model';

export const bakiye = {

  kasa: {
    artir(kasa,tutarX100) {
      Bakiye.Kasa.upsert(
        {kasa: kasa},
        {
          $set: {kasa},
          $inc: {tutarX100}
        }
      );
    },
    azalt(kasa,tutarX100) {
      Bakiye.Kasa.upsert(
        {kasa: kasa},
        {
          $set: {kasa},
          $inc: {tutarX100: -tutarX100}
        }
      );
    },
  },

  cari: {
    artir(cariKart,tutarX100TL) {
      Bakiye.Cari.upsert(
        {cariKart},
        {
          $set: {cariKart},
          $inc: {tutarX100TL}
        }
      );
    },
    azalt(cariKart,tutarX100TL) {
      Bakiye.Cari.upsert(
        {cariKart},
        {
          $set: {cariKart},
          $inc: {tutarX100TL: -tutarX100TL}
        }
      );
    },
  },

  stok: {
    artir(urun,konum,adet) {
      if (Urunler.findOne({_id: urun, stokTakipli: true})) {
        Bakiye.Stok.upsert(
          {urun, konum},
          {
            $set: {urun, konum},
            $inc: {adet}
          }
        );
      }
    },
    azalt(urun,konum,adet) {
      if (Urunler.findOne({_id: urun, stokTakipli: true})) {
        Bakiye.Stok.upsert(
          {urun, konum},
          {
            $set: {urun, konum},
            $inc: {adet: -adet}
          }
        );
      }
    },
  },

};
