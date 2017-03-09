import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const guncellemeBeyaniSchema = new SimpleSchema({
  guncellemeBeyani: {
    label: 'Güncelleme beyanı',
    type: Boolean,
    defaultValue: false,
    custom() {
      if (!this.isSet || this.value !== true) {
        return 'guncellemeBeyaniKabulEdilmeli';
      }
    },
  },
});

export const iptalOnayiSchema = new SimpleSchema({
  iptalAciklamasi: {
    label: 'İptal açıklaması',
    type: String,
    min: 3,
    max: 500,
    autoValue() {
      if (this.isSet) {
        return this.value.toTrimmed();
      }
    },
  },
  iptalOnayi: {
    label: 'İptal onayı',
    type: Boolean,
    defaultValue: false,
    custom() {
      if (!this.isSet || this.value !== true) {
        return 'iptalOnayiVerilmeli';
      }
    },
  },
});

SimpleSchema.messages({
  required: 'Boş bırakılamaz.',
  minString: 'En az [min] karakter olmalı.',
  maxString: 'En fazla [max] karakter olmalı.',
  minNumber: 'En az [min] olmalı.',
  maxNumber: 'En fazla [max] olmalı.',
  minDate: 'En erken [min] olmalı.',
  maxDate: 'En geç [max] olmalı.',
  minCount: 'En az [minCount] değer girilmeli.',
  maxCount: 'En fazla [maxCount] değer girilmeli.',
  noDecimal: 'Bir tam sayı olmalı.',
  notAllowed: 'İzin verilmeyen bir değer.',
  expectedString: 'Bir metin tipinde olmalı.',
  expectedNumber: 'Bir rakam tipinde olmalı.',
  expectedBoolean: 'Bir doğru/yanlış tipinde olmalı.',
  expectedArray: 'Bir dizi tipinde olmalı.',
  expectedObject: 'Bir nesne tipinde olmalı.',
  expectedConstructor: 'Uygun tipte veri olmalı.',
  regEx: [
    {msg: 'Format hatalı.'},
    {exp: SimpleSchema.RegEx.Email, msg: 'Geçersiz e-posta adresi.'},
    {exp: SimpleSchema.RegEx.WeakEmail, msg: 'Geçersiz e-posta adresi.'},
    {exp: SimpleSchema.RegEx.Domain, msg: 'Geçerli, http ile başlayan bir alan adı olmalı.'},
    {exp: SimpleSchema.RegEx.WeakDomain, msg: 'Geçerli, http ile başlayan bir alan adı olmalı.'},
    {exp: SimpleSchema.RegEx.IP, msg: 'Geçerli bir IPv4 veya IPv6 adresi olmalı.'},
    {exp: SimpleSchema.RegEx.IPv4, msg: 'Geçerli bir IPv4 adresi olmalı.'},
    {exp: SimpleSchema.RegEx.IPv6, msg: 'Geçerli bir IPv6 adresi olmalı.'},
    {exp: SimpleSchema.RegEx.Url, msg: 'Geçerli bir internet adresi olmalı.'},
    {exp: SimpleSchema.RegEx.Id, msg: 'Geçerli bir referans numarası olmalı.'}
  ],
  keyNotInSchema: 'Veri yapısında olmayan alanlar kullanılamaz.',
  notUnique: 'Girilen değer zaten kullanımda.',
  badFormat: 'Format hatalı.',
  endDateMustBeLater: 'Bitiş daha ileride olmalı.',
  hasInactiveValue: 'Kullanımı dondurulan değer içeriyor.',
  guncellemeBeyaniKabulEdilmeli: 'Güncelleme beyanı kabul edilmeden işlem gerçekleştirilemez.',
  gelirGiderBelirtilmeli: 'Gelir veya giderden en az biri işaretlenmeli.',
  ozelFiyatDusukOlmali: 'Özel fiyat daha düşük olmalı.',
  sinifGelirDegil: 'Satılabilirlik için sınıf bir gelir kalemi olmalı.',
  yetersizBakiye: 'Çıkış kasa bakiyesi yeterli değil.',
  tutarGirilmeli: 'En az 1 kuruş tutar girilmeli.',
  adetGirilmeli: 'En az 1 adet girilmeli.',
  vadeTarihiGecmisOlamaz: 'Vade tarihi işlem tarihinden önce olamaz.',
  kasaKuruHatali: 'Kasa kuru ile işlem kuru farklı.',
  kasaVadesiHatali: 'Vadeli işlemler çek senet kasasına yapılmalı.',
  vadelerKarisamaz: 'Çek senet kasasıyla diğer tipler arası transfer yapılamaz.',
  kasalarFarkliOlmali: 'Kasalar birbirinden farklı olmalı.',
  konumlarFarkliOlmali: 'Konumlar birbirinden farklı olmalı.',
  stokVar: 'Bu üründen hala kayıtlı stok var.',
  konumdaStokVar: 'Bu konumda kayıtlı stok var.',
  kasadaParaVar: 'Bu kasada kayıtlı para var.',
  satistaUrunVar: 'Bu sınıfın hala satışta ürünü var.',
  urunSatistaDegil: 'Bu ürün satılabilir olarak işaretli değil.',
  urunStokTakibindeDegil: 'Bu ürün stok takipli olarak işaretli değil.',
  urunGiderDegil: 'Bu ürünün sınıfı gider olarak işaretli değil.',
  yetersizStok: 'Çıkış konumu stoğu yeterli değil.',
  iptalOnayiVerilmeli: 'İptal onayı verilmeden işlem gerçekleştirilemez.',
  islendiIsartlenmeli: 'İşlendi olarak işaretlenmeli.',
});
