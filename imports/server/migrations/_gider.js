import { bakiye } from '/imports/api/methods/shared/bakiye';
import moment from 'moment-timezone';
import { CKID, KEVSER, VDURUN } from './shared/id';
import { Random } from 'meteor/random';
import { Urunler, Giderler, Kurlar } from '/imports/api/model';
import { URUNLER, KURLAR } from '/imports/environment/enums';


export default function createGiderFixture() {

  const giderBilgileri = { cariKart: VD, adet: 1, gerceklestiren: KEVSER, urun: VDURUN, kur: KURLAR.TRY.value, islemTarihi: Date.sistemAcilis(), belgeli: true };
  [
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20170131').toDate(), aciklama: 'Vergi yapılandırma ana para 1. taksidi' },
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20170331').toDate(), aciklama: 'Vergi yapılandırma ana para 2. taksidi' },
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20170531').toDate(), aciklama: 'Vergi yapılandırma ana para 3. taksidi' },
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20170731').toDate(), aciklama: 'Vergi yapılandırma ana para 4. taksidi' },
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20170930').toDate(), aciklama: 'Vergi yapılandırma ana para 5. taksidi' },
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20171130').toDate(), aciklama: 'Vergi yapılandırma ana para 6. taksidi' },
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20180131').toDate(), aciklama: 'Vergi yapılandırma ana para 7. taksidi' },
    { ...giderBilgileri, tutar: 1288, tutarKurus: 94, vadeTarihi: moment.utc('20180331').toDate(), aciklama: 'Vergi yapılandırma ana para 8. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20170131').toDate(), aciklama: 'Vergi yapılandırma faiz 1. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20170331').toDate(), aciklama: 'Vergi yapılandırma faiz 2. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20170531').toDate(), aciklama: 'Vergi yapılandırma faiz 3. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20170731').toDate(), aciklama: 'Vergi yapılandırma faiz 4. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20170930').toDate(), aciklama: 'Vergi yapılandırma faiz 5. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20171130').toDate(), aciklama: 'Vergi yapılandırma faiz 6. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20180131').toDate(), aciklama: 'Vergi yapılandırma faiz 7. taksidi' },
    { ...giderBilgileri, tutar: 281, tutarKurus: 82, vadeTarihi: moment.utc('20180331').toDate(), aciklama: 'Vergi yapılandırma faiz 8. taksidi' },
  ].forEach(gider => {
    Giderler.insert(gider);
    bakiye.cari.artir(gider.cariKart, (gider.tutar * 100 + gider.tutarKurus));
  });

  [
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '20', isim: 'AYAKLI DALGIÇ', marka: mch, sinif: bx, fiyat: 30, ozelFiyat: 30, kur: 'TRY', kdv: 18, adet: 5, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 20, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK25 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '23', isim: 'DALGIÇ MAGNET', marka: mch, sinif: bx, fiyat: 15, ozelFiyat: 15, kur: 'TRY', kdv: 18, adet: 12, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 10, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK25 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '25', isim: 'BAYKUŞ MAGNET', marka: mch, sinif: bx, fiyat: 8, ozelFiyat: 8, kur: 'TRY', kdv: 18, adet: 17, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 5, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK25 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '31', isim: 'MOTOR', marka: mch, sinif: bx, fiyat: 150, ozelFiyat: 150, kur: 'TRY', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 120, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK25 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '99', isim: 'SHORTY XL', marka: mae, sinif: bw, fiyat: 159, ozelFiyat: 159, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 135, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK15 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '109', isim: 'SHORTY L', marka: mae, sinif: bw, fiyat: 159, ozelFiyat: 159, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 135, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK15 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '163', isim: 'ŞİMA  T SHIRT', marka: mcd, sinif: ca, fiyat: 75, ozelFiyat: 75, kur: 'TRY', kdv: 8, adet: 19, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 75, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK11 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '185', isim: 'BAFF', marka: maz, sinif: ca, fiyat: 40, ozelFiyat: 40, kur: 'TRY', kdv: 8, adet: 13, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 28, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK14 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '185', isim: 'BAFF', marka: maz, sinif: ca, fiyat: 40, ozelFiyat: 40, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 0, konum: K_TEKNE, alisTutar: 28, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK14 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000025', isim: 'DEEP IN GALATA E / M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000026', isim: 'STARFISH LOVE AT NIGHT E / M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000027', isim: 'LOVE SURFING ON WHALE E / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000028', isim: 'LOVE SURFING ON WHALE E / M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000029', isim: 'DEEP IN KAŞ E / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000030', isim: 'DEEP IN KAŞ B / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000031', isim: 'DEEP IN KAŞ B / M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000032', isim: 'DEEP IN GALATA E / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000033', isim: 'DEEP IN GALATA E / L', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000034', isim: 'FISHING THE LOVE B / M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000035', isim: 'LOVE SURFING ON WHALE B / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000036', isim: 'LOVE SURFING ON WHALE B / XS', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000037', isim: 'CALCULATION OF OCTOPUS LOVE E / M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000038', isim: 'CALCULATION OF OCTOPUS LOVE E / L', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000039', isim: 'CALCULATION OF OCTOPUS LOVE B / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000047', isim: 'YAKA İĞNESİ BALIKLI', marka: mal, sinif: bx, fiyat: 20, ozelFiyat: 20, kur: 'TRY', kdv: 18, adet: 24, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 13, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK20 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000056', isim: 'FISHING THE LOVE E / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000070', isim: 'FISHING THE LOVE E / L', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000117', isim: 'LOVE SURFING ON WHALE E /L', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000131', isim: 'CALCULATION OF OCTOPUS LOVE E / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000162', isim: 'CALCULATION OF OCTOPUS LOVE B / XL', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000186', isim: 'DEEP IN KAŞ E / M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 3, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000216', isim: 'STARFISH LOVE AT NIGHT E / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000261', isim: 'DEEP IN GALATA B / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000292', isim: 'FISHING THE LOVE B / XS', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000308', isim: 'FISHING THE LOVE B / S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000377', isim: 'CALCULATION OF OCTOPUS LOVE B / XS', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000476', isim: 'ATL.DEEP IN GALATA M', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000483', isim: 'ATL.DEEP IN GALATA L', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000520', isim: 'DEEP IN KAŞ B / L', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30000554', isim: 'ATL.DEEP IN KAŞ – S', marka: mcb, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 38, alisKurus: 50, alisKur: 'TRY', cariKart: CKID.CK12 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30001299', isim: 'KARİA YOLU', marka: mao, sinif: by, fiyat: 35, ozelFiyat: 35, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 25, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK19 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '30001312', isim: 'A GUIDE TO KAYAKOY', marka: mao, sinif: by, fiyat: 20, ozelFiyat: 20, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 20, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK19 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '855712000110', isim: 'INTOVA FENER 120 M /YILMAZLAR', marka: mbd, sinif: bw, fiyat: 179, ozelFiyat: 179, kur: 'TRY', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 140, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK21 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '855712000110', isim: 'INTOVA FENER 120 M /YILMAZLAR', marka: mbd, sinif: bw, fiyat: 179, ozelFiyat: 179, kur: 'TRY', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 140, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK21 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1000000000000', isim: 'NERMO T-SHIRT', marka: mbe, sinif: ca, fiyat: 50, ozelFiyat: 50, kur: 'TRY', kdv: 8, adet: 16, stokUyariLimiti: 1, konum: K_DUKKAN, alisTutar: 40, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK22 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1645456016399', isim: 'AVANTI HP 40 41', marka: maw, sinif: bw, fiyat: 52, ozelFiyat: 52, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 103, alisKurus: 73, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1645456016504', isim: 'AVANTI HP 38 39', marka: maw, sinif: bw, fiyat: 52, ozelFiyat: 52, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 103, alisKurus: 73, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1645456016511', isim: 'AVANTI HP 40 41 2', marka: maw, sinif: bw, fiyat: 52, ozelFiyat: 52, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 103, alisKurus: 73, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1645456016528', isim: 'AVANTI HP 42 43', marka: maw, sinif: bw, fiyat: 52, ozelFiyat: 52, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 103, alisKurus: 73, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1768225087571', isim: 'MASKE KONA', marka: maw, sinif: bw, fiyat: 93, ozelFiyat: 93, kur: 'EUR', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 30, alisKurus: 0, alisKur: 'EUR', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1768225092452', isim: 'CHALLENGE 27 30', marka: maw, sinif: bw, fiyat: 29, ozelFiyat: 29, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 57, alisKurus: 85, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1768225092605', isim: 'CHALLENGE 40 41', marka: maw, sinif: bw, fiyat: 29, ozelFiyat: 29, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 57, alisKurus: 85, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1768225092636', isim: 'CHALLENGE 42 43', marka: maw, sinif: bw, fiyat: 29, ozelFiyat: 29, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 57, alisKurus: 85, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1768225161196', isim: 'CHALLENGE 31 33', marka: maw, sinif: bw, fiyat: 29, ozelFiyat: 29, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 57, alisKurus: 85, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1768225161349', isim: 'CHALLENGE 38 39', marka: maw, sinif: bw, fiyat: 29, ozelFiyat: 29, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 57, alisKurus: 85, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1768225161356', isim: 'CHALLENGE 40 41 2', marka: maw, sinif: bw, fiyat: 29, ozelFiyat: 29, kur: 'EUR', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 57, alisKurus: 85, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1792460020970', isim: 'SWIM GLOVE ', marka: maw, sinif: bw, fiyat: 53, ozelFiyat: 53, kur: 'TRY', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 53, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1792460033413', isim: '36 37 SWIM FIN ENERGY', marka: maw, sinif: bw, fiyat: 85, ozelFiyat: 85, kur: 'TRY', kdv: 18, adet: 2, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 85, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1792460033413', isim: '36 37 SWIM FIN ENERGY', marka: maw, sinif: bw, fiyat: 85, ozelFiyat: 85, kur: 'TRY', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 85, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '1792460033451', isim: '44 45 SWIM FIN ENERGY', marka: maw, sinif: bw, fiyat: 85, ozelFiyat: 85, kur: 'TRY', kdv: 18, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 85, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK13 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9780957154728', isim: 'THE LYCIAN WAY', marka: mbj, sinif: by, fiyat: 75, ozelFiyat: 75, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 25, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK23 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9780957154729', isim: 'SAINT NICHOLAS WAYS TR/ENG', marka: mbj, sinif: by, fiyat: 60, ozelFiyat: 60, kur: 'TRY', kdv: 8, adet: 3, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 35, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK23 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9783831718757', isim: 'TÜRKEİ LYKİSCHE KÜSTE', marka: mcc, sinif: by, fiyat: 20, ozelFiyat: 20, kur: 'EUR', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 12, alisKurus: 90, alisKur: 'EUR', cariKart: CKID.CK24 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9783866864757', isim: 'OUTDOOR LYKİSCHER WEG', marka: mcc, sinif: by, fiyat: 18, ozelFiyat: 18, kur: 'EUR', kdv: 8, adet: 2, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 10, alisKurus: 0, alisKur: 'EUR', cariKart: CKID.CK24 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786051270777', isim: 'KIPIRDAMA ÇEKİYORUM ', marka: mai, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 10, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 25, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK18 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940065', isim: 'CARDBOOK OF TURKEY', marka: mco, sinif: by, fiyat: 16, ozelFiyat: 16, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 9, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940140', isim: 'CARDBOOK OF ANTALYA', marka: mco, sinif: by, fiyat: 16, ozelFiyat: 16, kur: 'TRY', kdv: 8, adet: 3, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 9, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940157', isim: 'CARDBOOKOF KONYA AND MEVLANA', marka: mco, sinif: by, fiyat: 16, ozelFiyat: 16, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 9, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940188', isim: 'LIKYA YOLLARINDA TR', marka: mco, sinif: by, fiyat: 49, ozelFiyat: 49, kur: 'TRY', kdv: 8, adet: 5, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 28, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940195', isim: 'LYCIAN WAY İNGİLİZCE', marka: mco, sinif: by, fiyat: 49, ozelFiyat: 49, kur: 'TRY', kdv: 8, adet: 4, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 28, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940201', isim: 'HİTİT UYGARLI İZİNDE ANADOLU', marka: mco, sinif: by, fiyat: 49, ozelFiyat: 49, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 28, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940249', isim: 'EPHESOS ingilizce', marka: mco, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 14, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940256', isim: 'EPHESOS almanca', marka: mco, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 3, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 14, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940263', isim: 'EFES VE ION KENTLERİ', marka: mco, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 14, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940287', isim: 'HIERAPOLIS PAMUKKALE TÜRKÇE', marka: mco, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 14, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940294', isim: 'HIERAPOLIS PAMUKKALE İNGİLİZCE', marka: mco, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 2, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 14, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940317', isim: 'APHRODISIAS VE ÇEVRESİ', marka: mco, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 1, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 14, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9786055940324', isim: 'APHRODISIAS VE ÇEVRESİ ING', marka: mco, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 5, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 14, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK9 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9789757638681', isim: 'LİKYA YOLUNDA YÜRÜMEK-TÜRKÇE', marka: mbj, sinif: by, fiyat: 75, ozelFiyat: 75, kur: 'TRY', kdv: 8, adet: 5, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 25, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK23 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9789758416271', isim: 'SECRETS OF THE SEA', marka: mac, sinif: by, fiyat: 20, ozelFiyat: 20, kur: 'TRY', kdv: 8, adet: 31, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 20, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK16 },
    { _id: Random.id(), tip: URUNLER.MAL.value, satilabilir: true, stokTakipli: true, barkod: '9789944628884', isim: 'TÜPLÜ DALIŞIN SIRLARI', marka: mah, sinif: by, fiyat: 25, ozelFiyat: 25, kur: 'TRY', kdv: 8, adet: 9, stokUyariLimiti: 0, konum: K_DUKKAN, alisTutar: 25, alisKurus: 0, alisKur: 'TRY', cariKart: CKID.CK17 },
  ].forEach(({adet, konum, alisTutar, alisKurus, alisKur, cariKart, ...stok}, ix, arr) => {
    const urun = Urunler.findOne({barkod: stok.barkod});
    let urunId = arr[ix]._id;
    if (!urun) {
      Urunler.insert(stok);
    } else {
      urunId = urun._id;
    }
    if (adet > 0) {
      const giderDoc = {
        cariKart,
        konum,
        adet,
        urun: urunId,
        tutar: alisTutar,
        tutarKurus: alisKurus,
        kur: alisKur,
        islemTarihi: Date.sistemAcilis(),
        vadeTarihi: Date.sistemAcilis(),
        gerceklestiren: KEVSER,
        belgeli: true,
        konsinye: true,
        aciklama: 'Konsinye ürün girişi',
      };
      Giderler.insert(giderDoc);
      bakiye.cari.artir(cariKart, Math.round( (alisTutar * 100 + alisKurus) * Kurlar.findOne({tarih: Date.sistemAcilis()})[alisKur] ) );
      bakiye.stok.artir(urunId, konum, adet);
    }
  });

}
