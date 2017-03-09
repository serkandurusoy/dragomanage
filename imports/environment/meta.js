export const ROLLER = {
  NORMAL: { value: 'normal', label: 'Normal' },
  ADMIN: { value: 'admin', label: 'Admin' },
  PATRON: { value: 'patron', label: 'Patron' },
};

export const YETKILER = {
  PUBLIC: { sistem: true, value: 'public', label: 'Public' },
  SECRET: { sistem: true, value: 'secret', label: 'Secret' },
  TALEPLER: { value: 'talepler', label: 'Talep kayıtları' },
  TANIMLAR: { value: 'tanimlar', label: 'Temel tanımlar' },
  CARI_KARTLAR: { value: 'cariKartlar', label: 'Cari kart tanımları' },
  URUNLER: { value: 'urunler', label: 'Ürün tanımları' },
  MUHASEBE: { value: 'muhasebe', label: 'Muhasebe kayıtları' },
  RAPOR_URUN: { value: 'raporUrun', label: 'Ürün raporları' },
  RAPOR_MUHASEBE: { value: 'raporMuhasebe', label: 'Muhasebe raporları' },
};

export const COLLECTIONS = {
  TALEP: { value: 'Talepler', operationLabel: 'talep', label: 'Talep', modal:'TalepModal', yetki: YETKILER.TALEPLER.value },
  CARI_KART: { value: 'CariKartlar', operationLabel: 'cari kart', label: 'Cari kart', modal:'CariKartModal', yetki: YETKILER.CARI_KARTLAR.value },
  URUN: { value: 'Urunler', operationLabel: 'ürün', label: 'Ürün', modal:'UrunModal', yetki: YETKILER.URUNLER.value },
  TAHSILAT: { value: 'Tahsilatlar', operationLabel: 'tahsilat', label: 'Tahsilat', modal:'TahsilatModal', yetki: YETKILER.MUHASEBE.value },
  ODEME: { value: 'Odemeler', operationLabel: 'ödeme', label: 'Ödeme', modal:'OdemeModal', yetki: YETKILER.MUHASEBE.value },
  KASA_TRANSFERI: { value: 'KasaTransferleri', operationLabel: 'kasa transferi', label: 'Kasa transferi', modal:'KasaTransferiModal', yetki: YETKILER.MUHASEBE.value },
  GELIR: { value: 'Gelirler', operationLabel: 'gelir', label: 'Gelir', modal:'GelirModal', yetki: YETKILER.MUHASEBE.value },
  GIDER: { value: 'Giderler', operationLabel: 'gider', label: 'Gider', modal:'GiderModal', yetki: YETKILER.MUHASEBE.value },
  STOK_TRANSFERI: { value: 'StokTransferleri', operationLabel: 'stok transferi', label: 'Stok transferi', modal:'stokTransferiModal', yetki: YETKILER.URUNLER.value },
  ETIKET: { value: 'Etiketler', operationLabel: 'etiket', label: 'Etiket', modal: 'EtiketModal', yetki: YETKILER.TANIMLAR.value },
  SINIF: { value: 'Siniflar', operationLabel: 'sınıf', label: 'Sınıf', modal: 'SinifModal', yetki: YETKILER.TANIMLAR.value },
  MARKA: { value: 'Markalar', operationLabel: 'marka', label: 'Marka', modal: 'MarkaModal', yetki: YETKILER.URUNLER.value },
  KASA: { value: 'Kasalar', operationLabel: 'kasa', label: 'Kasa', modal: 'KasaModal', yetki: YETKILER.TANIMLAR.value },
  KONUM: { value: 'Konumlar', operationLabel: 'konum', label: 'Konum', modal: 'KonumModal', yetki: YETKILER.TANIMLAR.value },
  KULLANICI: { value: 'Kullanicilar', operationLabel: 'kullanıcı', label: 'Kullanıcı', modal: 'KullaniciModal', yetki: YETKILER.SECRET.value },
};

export const LIMIT = 15;
