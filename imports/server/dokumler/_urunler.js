import { Urunler as collection} from '/imports/api/model';
import { Siniflar, Markalar} from '/imports/api/model';
import {
  URUNLER,
  KDVLER,
  KURLAR,
  MENSEILER
} from '/imports/environment/enums';

export default function(ws) {
  const style = { font: { name: 'Arial', size: 8 } };

  const fields = [
    'tip',
    'etiketler',
    'sinif',
    'mensei',
    'marka',
    'isim',
    'gelireUygun',
    'gidereUygun',
    'satilabilir',
    'barkod',
    'stokTakipli',
    'stokUyariLimiti',
    'fiyat',
    'ozelFiyat',
    'kdv',
    'kur',
    'notlar',
    'aktif',
  ];

  ws.columns = fields.map(f => ({
    header: collection.Schema.label(f),
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
      tip: r.tip && r.tip.enumValueToLabel(URUNLER),
      mensei: r.mensei && r.mensei.enumValueToLabel(MENSEILER),
      kdv: r.kdvLabel(),
      kur: r.kur && r.kur.enumValueToLabel(KURLAR),
      etiketler: r.etiketLabels().join(', '),
      sinif: r.sinif && Siniflar.findOne(r.sinif).label(),
      marka: r.marka && Markalar.findOne(r.marka).isim,
      gelireUygun: r.gelireUygun ? 'Evet' : 'Hayır',
      gidereUygun: r.gidereUygun ? 'Evet' : 'Hayır',
      satilabilir: r.satilabilir ? 'Evet' : 'Hayır',
      stokTakipli: r.stokTakipli ? 'Evet' : 'Hayır',
      aktif: r.aktif ? 'Evet' : 'Hayır',
    });
    ws.addRow(row).commit();
  });

}
