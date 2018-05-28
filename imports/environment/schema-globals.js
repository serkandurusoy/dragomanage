import SimpleSchema from 'simpl-schema';
import MessageBox from 'message-box';

export const guncellemeBeyaniSchema = new SimpleSchema({
  guncellemeBeyani: {
    label: 'Güncelleme beyanı',
    type: Boolean,
    defaultValue: false,
    blackbox:true,
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

MessageBox.defaults({
    en: {
      required: '{{label}} boş bırakılamaz.',
      minString: '{{label}} en az {{min}} karakter olmalı.',
      maxString: '{{label}} en fazla {{max}} karakter olmalı.',
      minNumber: '{{label}} en az {{min}} olmalı.',
      maxNumber: '{{label}} en fazla {{max}} olmalı.',
      minDate: '{{label}} en erken {{min}} olmalı.',
      maxDate: '{{label}} en geç {{max}} olmalı.',
      minCount: '{{label}} en az {{minCount}} değer girilmeli.',
      maxCount: '{{label}} en fazla {{maxCount}} değer girilmeli.',
      noDecimal: '{{label}} bir tam sayı olmalı.',
      notAllowed: '{{label}} izin verilmeyen bir değer.',
      expectedString: '{{label}} bir metin tipinde olmalı.',
      expectedNumber: '{{label}} bir rakam tipinde olmalı.',
      expectedBoolean: '{{label}} bir doğru/yanlış tipinde olmalı.',
      expectedArray: '{{label}} bir dizi tipinde olmalı.',
      expectedObject: '{{label}} bir nesne tipinde olmalı.',
      expectedConstructor: '{{label}} uygun tipte veri olmalı.',
      regEx({label,regExp}){
        switch(regExp){
          case (SimpleSchema.RegEx.Email.toString()):
            return 'Geçersiz e-posta adresi.';
          case (SimpleSchema.RegEx.WeakEmail.toString()):
            return 'Geçersiz e-posta adresi.';
          case (SimpleSchema.RegEx.Domain.toString()):
            return 'Geçerli, http ile başlayan bir alan adı olmalı.';
          case (SimpleSchema.RegEx.WeakDomain.toString()):
            return 'Geçerli, http ile başlayan bir alan adı olmalı.';
          case (SimpleSchema.RegEx.IP.toString()):
            return 'Geçerli bir IPv4 veya IPv6 adresi olmalı.';
          case (SimpleSchema.RegEx.IPv4.toString()):
            return 'Geçerli bir IPv4 adresi olmalı.';
          case (SimpleSchema.RegEx.IPv6.toString()):
            return 'Geçerli bir IPv4 veya IPv6 adresi olmalı.';
          case (SimpleSchema.RegEx.Url.toString()):
            return 'Geçerli bir internet adresi olmalı.';
          case (SimpleSchema.RegEx.Id.toString()):
            return 'Geçerli bir referans numarası olmalı.';
        }
      },
      keyNotInSchema: 'Veri yapısında olmayan alanlar kullanılamaz.',
      notUnique: '{{label}} için girilen değer zaten kullanımda.',
      badFormat: '{{label}} formatı hatalı.',
      endDateMustBeLater: 'Bitiş daha ileride olmalı.',
      hasInactiveValue: '{{label}} kullanımı dondurulan değer içeriyor.',
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
    }

});

/*

regEx: [
  {msg: '{{label}} formatı hatalı.'},
  {exp: SimpleSchema.RegEx.Email, msg: 'Geçersiz e-posta adresi.'},
  {exp: SimpleSchema.RegEx.WeakEmail, msg: 'Geçersiz e-posta adresi.'},
  {exp: SimpleSchema.RegEx.Domain, msg: 'Geçerli, http ile başlayan bir alan adı olmalı.'},
  {exp: SimpleSchema.RegEx.WeakDomain, msg: 'Geçerli, http ile başlayan bir alan adı olmalı.'},
  {exp: SimpleSchema.RegEx.IP, msg: 'Geçerli bir IPv4 veya IPv6 adresi olmalı.'},
  {exp: SimpleSchema.RegEx.IPv4, msg: 'Geçerli bir IPv4 adresi olmalı.'},
  {exp: SimpleSchema.RegEx.IPv6, msg: 'Geçerli bir IPv6 adresi olmalı.'},
  {exp: SimpleSchema.RegEx.Url, msg: 'Geçerli bir internet adresi olmalı.'},
  {exp: SimpleSchema.RegEx.Id, msg: 'Geçerli bir referans numarası olmalı.'}
],*/
