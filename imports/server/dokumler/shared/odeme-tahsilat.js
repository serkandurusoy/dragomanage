import {
  KURLAR,
} from '/imports/environment/enums';

export const wsBuilder = function(ws, collection) {
  const style = { font: { name: 'Arial', size: 8 } };

  const fields = [
    'islemTarihi',
    'vadeTarihi',
    'cariKart',
    'tutar',
    'kur',
    'tlKarsiligi',
    'iptal',
    'gerceklestiren',
    'kasa',
    'etiketler',
    'aciklama',
  ];

  ws.columns = fields.map(f => ({
    header: f === 'tlKarsiligi' ? 'TL Karşılığı' : f === 'iptal' ? 'İptal' : collection.Schema.label(f),
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
      kur: r.kur && r.kur.enumValueToLabel(KURLAR),
      etiketler: r.etiketLabels().join(', '),
      tutar: r.tutarX100 / 100,
      tlKarsiligi: r.tutarX100TL / 100,
      iptal: r.tutarX100 === 0 ? 'Evet' : '',
      cariKart: r.cariKartLabel(),
      gerceklestiren: r.gerceklestirenLabel(),
      kasa: r.kasaLabel(),
    });
    ws.addRow(row).commit();
  });

}
