import { KasaTransferleri as collection} from '/imports/api/model';
import {
  KURLAR,
} from '/imports/environment/enums';

export default function(ws) {
  const style = { font: { name: 'Arial', size: 8 } };

  const fields = [
    'kasaKaynak',
    'kasaHedef',
    'islemTarihi',
    'tutar',
    'kur',
    'tl',
    'iptal',
    'aciklama',
  ];

  ws.columns = fields.map(f => ({
    header: f === 'tl' ? 'TL Karşılığı' : f === 'iptal' ? 'İptal' : collection.Schema.label(f),
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
      tutar: r.tutarX100 / 100,
      tl: r.tutarX100TL / 100,
      iptal: r.tutarX100 === 0 ? 'Evet' : '',
      kasaKaynak: r.kasaKaynakLabel(),
      kasaHedef: r.kasaHedefLabel(),
    });
    ws.addRow(row).commit();
  });

}
