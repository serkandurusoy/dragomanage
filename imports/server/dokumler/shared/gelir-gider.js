import {
  KURLAR,
} from '/imports/environment/enums';

export const wsBuilder = function(ws, collection) {
  const style = { font: { name: 'Arial', size: 8 } };

  const fields = [
    'islemTarihi',
    'vadeTarihi',
    'cariKart',
    'sinif',
    'urun',
    'adet',
    'konum',
    'urunFiyat',
    'urunOzelFiyat',
    'urunKur',
    'urunFiyatTL',
    'urunOzelFiyatTL',
    'tutar',
    'kur',
    'tlKarsiligi',
    'urunKdv',
    'iptal',
    'belgeli',
    'konsinye',
    'dosyaNo',
    'gerceklestiren',
    'etiketler',
    'aciklama',
  ];

  ws.columns = fields.map(f => ({
    header: f === 'tlKarsiligi'
      ? 'TL Karşılığı'
      : f === 'iptal'
        ? 'İptal'
        : f === 'urunFiyatTL'
          ? 'TL Fiyat'
          : f === 'urunOzelFiyatTL'
            ? 'TL Özel Fiyat'
            : f === 'sinif'
              ? 'Sınıf'
              : collection.Schema.label(f),
    key: f,
    style,
  })).concat([
    { header: 'Referans', key: '_id', style},
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
      urunKur: r.urunKur && r.urunKur.enumValueToLabel(KURLAR),
      kur: r.kur && r.kur.enumValueToLabel(KURLAR),
      etiketler: r.etiketLabels().join(', '),
      tutar: r.tutarX100 / 100,
      tlKarsiligi: r.tutarX100TL / 100,
      iptal: r.tutarX100 === 0 ? 'Evet' : '',
      belgeli: r.belgeli ? 'Evet' : '',
      konsinye: r.konsinye ? 'Evet' : '',
      cariKart: r.cariKartLabel(),
      urun: r.urunLabel(),
      konum: r.konumLabel(),
      gerceklestiren: r.gerceklestirenLabel(),
      urunKdv: r.kdvLabel(),
      urunFiyatTL: r.urunFiyatX100TL / 100,
      urunOzelFiyatTL: r.urunOzelFiyatX100TL / 100,
      sinif: r.sinifLabel(),
    });
    ws.addRow(row).commit();
  });

}
