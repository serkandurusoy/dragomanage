import {
  Kullanicilar,
  Etiketler,
  CariKartlar,
  Kasalar,
  Konumlar,
  Urunler,
  Giderler,
  Siniflar,
  Markalar,
  Timeline,
} from '/imports/api/model';

export default function resetTimestamps() {

  [
    Kullanicilar,
    Etiketler,
    CariKartlar,
    Kasalar,
    Konumlar,
    Urunler,
    Giderler,
    Siniflar,
    Markalar,
  ].forEach(collection => collection.direct.update({}, {
      $set: {
        createdAt: Date.sistemAcilis(),
        modifiedAt: Date.sistemAcilis(),
      }
    }, {
      multi: true,
      bypassCollection2: true,
    }));

  Timeline.update({}, {
      $set: {
        recordedAt: Date.sistemAcilis(),
        daysFromRecord: 0,
      },
    }, {
      multi: true,
      bypassCollection2: true,
    });

}
