import { Random } from 'meteor/random';
import { Kasalar, Bakiye } from '/imports/api/model';
import { KURLAR, KASALAR } from '/imports/environment/enums';

export default function createKasaFixture() {

  [
    {
      tip: KASALAR.NAKIT.value,
      kur: KURLAR.TRY.value,
      isim: 'Tekne Nakit TL',
    },
    {
      tip: KASALAR.NAKIT.value,
      kur: KURLAR.TRY.value,
      isim: 'Elif Nakit TL',
    },
    {
      _id: OFIS_NAKIT_TL = Random.id(),
      tip: KASALAR.NAKIT.value,
      kur: KURLAR.TRY.value,
      isim: 'Ofis Nakit TL',
    },
    {
      tip: KASALAR.NAKIT.value,
      kur: KURLAR.GBP.value,
      isim: 'Ofis Nakit GBP',
    },
    {
      tip: KASALAR.NAKIT.value,
      kur: KURLAR.EUR.value,
      isim: 'Ofis Nakit EUR',
    },
    {
      tip: KASALAR.NAKIT.value,
      kur: KURLAR.USD.value,
      isim: 'Ofis Nakit USD',
    },
    {
      tip: KASALAR.BANKA.value,
      kur: KURLAR.TRY.value,
      isim: 'Garanti TL',
    },
    {
      _id: YKB_KREDILI_TL = Random.id(),
      tip: KASALAR.KREDILI_MEVDUAT.value,
      kur: KURLAR.TRY.value,
      isim: 'YKB Kredili TL',
    },
    {
      tip: KASALAR.BANKA.value,
      kur: KURLAR.TRY.value,
      isim: 'YKB TL',
    },
    {
      tip: KASALAR.BANKA.value,
      kur: KURLAR.EUR.value,
      isim: 'YKB EUR',
    },
    {
      tip: KASALAR.BANKA.value,
      kur: KURLAR.USD.value,
      isim: 'YKB USD',
    },
    {
      tip: KASALAR.BANKA.value,
      kur: KURLAR.GBP.value,
      isim: 'YKB GBP',
    },
    {
      tip: KASALAR.BANKA.value,
      kur: KURLAR.TRY.value,
      isim: 'Kızıldeniz TL',
    },
    {
      tip: KASALAR.BANKA.value,
      kur: KURLAR.TRY.value,
      isim: 'DGK TL',
    },
    {
      tip: KASALAR.CEK_SENET.value,
      kur: KURLAR.TRY.value,
      isim: 'DGK TL',
    },
    {
      tip: KASALAR.POS.value,
      kur: KURLAR.TRY.value,
      isim: 'POS TL',
    },
    {
      _id: YKB_SKK_1 = Random.id(),
      tip: KASALAR.KREDI_KARTI.value,
      kur: KURLAR.TRY.value,
      isim: 'YKB Şirket Kartı Murat Draman',
    },
    {
      _id: YKB_SKK_2 = Random.id(),
      tip: KASALAR.KREDI_KARTI.value,
      kur: KURLAR.TRY.value,
      isim: 'YKB Şirket Kartı Tolga Yücel',
    },
  ].forEach(kasa => {
    Kasalar.insert(kasa);
  });

  [
    {
      kasa: OFIS_NAKIT_TL,
      tutarX100: 45800,
    },
    {
      kasa: YKB_KREDILI_TL,
      tutarX100: 1096933,
    },
    {
      kasa: YKB_SKK_1,
      tutarX100: 451232,
    },
    {
      kasa: YKB_SKK_2,
      tutarX100: 376009,
    },
  ].forEach(bakiye => {
    Bakiye.Kasa.insert(bakiye);
    Bakiye.Kasa.Acilis.insert(bakiye);
  });
}
