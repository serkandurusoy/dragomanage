import { Kullanicilar } from '/imports/api/model';
import { ROLLER, YETKILER } from '/imports/environment/meta';
import { KEVSER } from './shared/id';

export default function createKullaniciFixture() {
  [
    {
      email: 'admin@dragoman-turkey.com',
      ad: 'Dragoman',
      soyad: 'Turkey',
      gizli: true,
      rol: ROLLER.ADMIN.value,
    },
    {
      email: 'serkan.durusoy@dna-tr.com',
      ad: 'Serkan',
      soyad: 'Durusoy',
      gizli: true,
      rol: ROLLER.ADMIN.value,
    },
    {
      email: 'gokalp@dragoman-turkey.com',
      ad: 'Gökalp',
      soyad: 'Urul',
      gizli: false,
      rol: ROLLER.ADMIN.value,
    },
    {
      email: 'murat@dragoman-turkey.com',
      ad: 'Murat',
      soyad: 'Draman',
      rol: ROLLER.PATRON.value,
    },
    {
      _id: KEVSER,
      email: 'kevser@dragoman-turkey.com',
      ad: 'Kevser',
      soyad: 'Mermertaş',
      yetkiler: [
        YETKILER.TALEPLER.value,
        YETKILER.TANIMLAR.value,
        YETKILER.CARI_KARTLAR.value,
        YETKILER.URUNLER.value,
        YETKILER.MUHASEBE.value,
        YETKILER.RAPOR_URUN.value,
        YETKILER.RAPOR_MUHASEBE.value,
      ],
    },
    {
      email: 'elif@dragoman-turkey.com',
      ad: 'Elif',
      soyad: 'Turgut',
      yetkiler: [
        YETKILER.TALEPLER.value,
        YETKILER.TANIMLAR.value,
        YETKILER.CARI_KARTLAR.value,
        YETKILER.URUNLER.value,
        YETKILER.MUHASEBE.value,
        YETKILER.RAPOR_URUN.value,
        YETKILER.RAPOR_MUHASEBE.value,
      ],
    },
    {
      email: 'tolga@dragoman-turkey.com',
      ad: 'Tolga',
      soyad: 'Yücel',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
    {
      email: 'ozan@dragoman-turkey.com',
      ad: 'Ozan',
      soyad: 'Atabilen',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
    {
      email: 'tuba@dragoman-turkey.com',
      ad: 'Tuba',
      soyad: 'Öz',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
    {
      email: 'cagatay@dragoman-turkey.com',
      ad: 'Çağatay',
      soyad: 'Arıcan',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
    {
      email: 'ozlem@dragoman-turkey.com',
      ad: 'Özlem',
      soyad: 'Güvenç',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
    {
      email: 'ohalacoglu@gmail.com',
      ad: 'Okan',
      soyad: 'Halaçoğlu',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
    {
      email: 'oakmankas@gmail.com',
      ad: 'Ömer',
      soyad: 'Akman',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
    {
      email: 'kguvencduman@gmail.com',
      ad: 'Güvenç',
      soyad: 'Duman',
      yetkiler: [
        YETKILER.TALEPLER.value,
      ],
    },
  ].forEach(kullanici => {
    Kullanicilar.insert(kullanici);
  });
}
