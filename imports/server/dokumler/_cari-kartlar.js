import { CariKartlar as collection} from '/imports/api/model';
import {
  CARI_KARTLAR,
  SEHIRLER,
  ULKELER,
  DILLER,
  CINSIYETLER,
  BEDENLER,
  DALIS_SERTIFIKALARI,
  DALIS_SEVIYELERI,
  SEKAYAK_SEVIYELERI,
} from '/imports/environment/enums';

export default function(ws) {
  const style = { font: { name: 'Arial', size: 8 } };

  const fields = [
    'tip',
    'etiketler',
    'unvan',
    'kisaIsim',
    'telefon',
    'email',
    'webSitesi',
    'adres',
    'sehir',
    'ulke',
    'vergiDairesi',
    'vergiNumarasi',
    'iban',
    'notlar',
    'sahisBilgileri.uyruk',
    'sahisBilgileri.pasaportVeyaTCNo',
    'sahisBilgileri.diller',
    'sahisBilgileri.cinsiyet',
    'sahisBilgileri.dogumTarihi',
    'sahisBilgileri.beden',
    'sahisBilgileri.ayak',
    'sahisBilgileri.dalisSertifikasi',
    'sahisBilgileri.dalisSeviyesi',
    'sahisBilgileri.seakayakSeviyesi',
    'sahisBilgileri.aktiviteNotlari',
  ];

  ws.columns = fields.map(f => ({
    header: collection.Schema.label(f),
    key: f,
    style,
  })).concat([
    { header: 'ID', key: '_id', style},
    { header: 'Kaydeden', key: 'recordedBy', style},
    { header: 'Kayıt', key: 'createdAt', style},
    { header: 'Versiyon', key: '_version', style},
    { header: 'Güncellenme', key: 'modifiedAt', style},
  ]);

  ws.getRow(1).font = { name: 'Arial', size: 10, bold: true };

  collection.find(
    {},
    { sort: {kisaIsim: 1} },
  ).forEach(r => {
    const row = Object.assign({}, r, {
      recordedBy: r.createdBy(),
      modifiedAt: r._version === 1 ? undefined : r.modifiedAt,
      tip: r.tip && r.tip.enumValueToLabel(CARI_KARTLAR),
      etiketler: r.etiketLabels().join(', '),
      sehir: r.sehir && r.sehir.enumValueToLabel(SEHIRLER),
      ulke: r.ulke && r.ulke.enumValueToLabel(ULKELER),
      'sahisBilgileri.uyruk': r.sahisBilgileri && r.sahisBilgileri.uyruk && r.sahisBilgileri.uyruk.enumValueToLabel(ULKELER),
      'sahisBilgileri.pasaportVeyaTCNo': r.sahisBilgileri && r.sahisBilgileri.pasaportVeyaTCNo,
      'sahisBilgileri.diller': r.sahisBilgileri && r.sahisBilgileri.diller && r.sahisBilgileri.diller.map(dil => dil.enumValueToLabel(DILLER)).join(', '),
      'sahisBilgileri.cinsiyet': r.sahisBilgileri && r.sahisBilgileri.cinsiyet && r.sahisBilgileri.cinsiyet.enumValueToLabel(CINSIYETLER),
      'sahisBilgileri.dogumTarihi': r.sahisBilgileri && r.sahisBilgileri.dogumTarihi,
      'sahisBilgileri.beden': r.sahisBilgileri && r.sahisBilgileri.beden && r.sahisBilgileri.beden.enumValueToLabel(BEDENLER),
      'sahisBilgileri.ayak': r.sahisBilgileri && r.sahisBilgileri.ayak,
      'sahisBilgileri.dalisSertifikasi': r.sahisBilgileri && r.sahisBilgileri.dalisSertifikasi && r.sahisBilgileri.dalisSertifikasi.enumValueToLabel(DALIS_SERTIFIKALARI),
      'sahisBilgileri.dalisSeviyesi': r.sahisBilgileri && r.sahisBilgileri.dalisSeviyesi && r.sahisBilgileri.dalisSeviyesi.enumValueToLabel(DALIS_SEVIYELERI),
      'sahisBilgileri.seakayakSeviyesi': r.sahisBilgileri && r.sahisBilgileri.seakayakSeviyesi && r.sahisBilgileri.seakayakSeviyesi.enumValueToLabel(SEKAYAK_SEVIYELERI),
      'sahisBilgileri.aktiviteNotlari': r.sahisBilgileri && r.sahisBilgileri.aktiviteNotlari,
    });
    ws.addRow(row).commit();
  });

}
