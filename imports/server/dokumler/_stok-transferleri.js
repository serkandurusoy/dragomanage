import { StokTransferleri as collection } from '/imports/api/model';

export default function(ws) {
  const style = { font: { name: 'Arial', size: 8 } };

  const fields = [
    'urun',
    'konumKaynak',
    'konumKaynakTip',
    'konumHedef',
    'konumHedefTip',
    'islemTarihi',
    'adet',
    'iptal',
    'aciklama',
  ];

  ws.columns = fields.map(f => ({
    header: ['konumKaynakTip', 'konumHedefTip'].includes(f)
      ? 'Tip'
      : f === 'iptal'
        ? 'İptal'
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
      iptal: r.adet === 0 ? 'Evet' : '',
      urun: r.urunLabel(),
      konumKaynak: r.konumKaynakLabel(),
      konumKaynakTip: r.konumKaynakTipLabel(),
      konumHedef: r.konumHedefLabel(),
      konumHedefTip: r.konumHedefTipLabel(),
    });
    ws.addRow(row).commit();
  });

}
