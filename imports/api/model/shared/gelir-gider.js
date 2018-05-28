import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { CariKartlar, Kullanicilar, Etiketler, Kurlar, Urunler, Konumlar, Siniflar } from '../';
import { ETIKETLER, KURLAR, KDVLER } from '/imports/environment/enums';

export const gelirGider = new SimpleSchema({
  etiketler: {
    label: 'Etiketler',
    type: Array,
    index: 1,
    autoValue() {
      if (!this.isSet || this.value === null) {
        return [];
      }
    },
    custom() {
      if (this.isSet && Etiketler.findOne({_id: {$in: this.value}, tip: ETIKETLER.MUHASEBE.value, aktif: false})) {
        return 'hasInactiveValue'
      }
    },
  },
  'etiketler.$': {
    label: 'Etiketler',
    type: String,
    custom() {
      if (this.isSet && !Etiketler.findOne({_id: this.value, tip: ETIKETLER.MUHASEBE.value})) {
        return 'notAllowed';
      }
    },
  },
  cariKart: {
    label: 'Cari kart',
    type: String,
    index: 1,
    custom() {
      if (Meteor.isServer && this.isSet && !!this.value && !CariKartlar.findOne({_id: this.value})) {
        return 'notAllowed';
      }
    },
  },
  konum: {
    label: 'Konum',
    type: String,
    index: 1,
    optional: true,
    autoValue() {
      const urun = this.field('urun');
      if (this.isSet && urun.isSet && !Urunler.findOne({_id: urun.value, stokTakipli: true})) {
        this.unset();
      }
    },
    custom() {
      const urun = this.field('urun');
      if (!this.isSet && urun.isSet && Urunler.findOne({_id: urun.value, stokTakipli: true})) {
        return 'required';
      }
      if (this.isSet && !!this.value && Konumlar.findOne({_id: this.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && !!this.value && !Konumlar.findOne({_id: this.value})) {
        return 'notAllowed';
      }
    },
  },
  adet: {
    label: 'Adet',
    type: Number,
    optional: true,
    min: 0,
    max: 100000,
    autoValue() {
      if (this.isInsert && !this.isSet) {
        return 1;
      }
    },
    custom() {
      if (this.isInsert) {
        if (!this.isSet || this.value < 1) {
          return 'required';
        }
      }
    }
  },
  urun: {
    label: 'Ürün',
    type: String,
    index: 1,
    custom() {
      if (this.isSet && !!this.value && Urunler.findOne({_id: this.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && !!this.value && Urunler.findOne({_id: this.value, gidereUygun: false, gelireUygun: true, satilabilir: false})) {
        return 'urunSatistaDegil';
      }
      if (this.isSet && !!this.value && !Urunler.findOne({_id: this.value})) {
        return 'notAllowed';
      }
    },
  },
  urunKdv: {
    label: 'Ürün kdvsi',
    type: Number,
    optional: true,
    autoValue() {
      const urun = this.field('urun');
      if (this.isInsert && urun.isSet) {
        const urunDoc = Urunler.findOne(urun.value);
        return urunDoc && (urunDoc.kdv || 0);
      }
    },
  },
  urunKur: {
    label: 'Ürün kuru',
    type: String,
    optional: true,
    autoValue() {
      const urun = this.field('urun');
      if (this.isInsert && urun.isSet) {
        const urunDoc = Urunler.findOne(urun.value);
        return urunDoc && (urunDoc.kur || KURLAR.TRY.value);
      }
    },
  },
  urunFiyat: {
    label: 'Ürün fiyatı',
    type: Number,
    optional: true,
    autoValue() {
      const urun = this.field('urun');
      const adet = this.field('adet');
      if (this.isInsert && urun.isSet) {
        const urunDoc = Urunler.findOne(urun.value);
        return urunDoc && (urunDoc.fiyat || 0) * (adet.value || 1);
      }
    },
  },
  urunOzelFiyat: {
    label: 'Ürün özel fiyatı',
    type: Number,
    optional: true,
    autoValue() {
      const urun = this.field('urun');
      const adet = this.field('adet');
      if (this.isInsert && urun.isSet) {
        const urunDoc = Urunler.findOne(urun.value);
        return urunDoc && (urunDoc.ozelFiyat || 0) * (adet.value || 1);
      }
    },
  },
  urunFiyatX100TL: {
    type: Number,
    optional: true,
    autoValue() {
      const islemTarihi = this.field('islemTarihi');
      const kurCinsi = this.field('urunKur');
      const urun = this.field('urun');
      const adet = this.field('adet');
      if (this.isInsert && urun.isSet && islemTarihi.isSet && kurCinsi.isSet) {
        const kur = Kurlar.findOne({tarih: islemTarihi.value})[kurCinsi.value];
        const urunDoc = Urunler.findOne(urun.value);
        const tutar =  urunDoc && (urunDoc.fiyat || 0) * (adet.value || 1);
        return Math.round(kur * ((tutar || 0) * 100));
      }
    },
  },
  urunOzelFiyatX100TL: {
    type: Number,
    optional: true,
    autoValue() {
      const islemTarihi = this.field('islemTarihi');
      const kurCinsi = this.field('urunKur');
      const urun = this.field('urun');
      const adet = this.field('adet');
      if (this.isInsert && urun.isSet && islemTarihi.isSet && kurCinsi.isSet) {
        const kur = Kurlar.findOne({tarih: islemTarihi.value})[kurCinsi.value];
        const urunDoc = Urunler.findOne(urun.value);
        const tutar =  urunDoc && (urunDoc.ozelFiyat || 0) * (adet.value || 1);
        return Math.round(kur * ((tutar || 0) * 100));
      }
    },
  },
  tutar: {
    label: 'Tutar',
    type: Number,
    min: 0,
    max: 100000,
    defaultValue: 0,
  },
  tutarKurus: {
    label: 'Kuruş',
    type: Number,
    min: 0,
    max: 99,
    defaultValue: 0,
  },
  tutarX100: {
    type: Number,
    min: 0,
    optional: true,
    autoValue() {
      const tutar = this.field('tutar');
      const tutarKurus = this.field('tutarKurus');
      return (tutar.value || 0) * 100 + (tutarKurus.value || 0);
    },
  },
  tutarX100TL: {
    type: Number,
    min: 0,
    optional: true,
    autoValue() {
      const islemTarihi = this.field('islemTarihi');
      const kurCinsi = this.field('kur');
      const tutar = this.field('tutar');
      const tutarKurus = this.field('tutarKurus');
      const kur = Kurlar.findOne({tarih: islemTarihi.value || Date.today()})[kurCinsi.value || KURLAR.TRY.value];
      return Math.round(kur * ((tutar.value || 0) * 100 + (tutarKurus.value || 0)));
    },
  },
  kur: {
    label: 'Kur',
    type: String,
    index: 1,
    allowedValues: Object.keys(KURLAR).map(v => KURLAR[v].value),
    autoValue() {
      if (this.isUpdate && this.isSet) {
        this.unset();
      }
    },
  },
  islemTarihi: {
    label: 'İşlem tarihi',
    type: Date,
    index: -1,
    defaultValue: Date.today(),
    custom() {
      const min = Date.sistemAcilis().isSameOrBefore(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter();
      const max = Date.today();
      if (this.isSet) {
        if (min.isAfter(this.value)) {
          return 'notAllowed';
        }
        if (max.isBefore(this.value)) {
          return 'notAllowed';
        }
      }
    }
  },
  vadeTarihi: {
    label: 'Vade tarihi',
    type: Date,
    index: -1,
    defaultValue: Date.today(),
    custom() {
      const min = Date.sistemAcilis().isSameOrBefore(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter();
      const max = Date.inTwoYears();
      const islemTarihi = this.field('islemTarihi');
      if (islemTarihi.isSet && this.isSet) {
        if (islemTarihi.value.isAfter(this.value)) {
          return 'vadeTarihiGecmisOlamaz';
        }
        if (min.isAfter(this.value)) {
          return 'notAllowed';
        }
        if (max.isBefore(this.value)) {
          return 'notAllowed';
        }
      }
    }
  },
  gerceklestiren: {
    label: 'Gerçekleştiren',
    type: String,
    index: 1,
    autoValue() {
      if (!this.isSet && this.userId) {
        return Meteor.users.findOne(this.userId).kullanici()._id
      }
    },
    custom() {
      if (this.isSet && !!this.value && Kullanicilar.findOne({
          $and: [
            {_id: this.value},
            {$or: [
              {aktif: false},
              {gizli: true},
            ]},
          ],
        })) {
        return 'hasInactiveValue';
      }
      if (this.isSet && !!this.value && !Kullanicilar.findOne({_id: this.value})) {
        return 'notAllowed';
      }
    },
  },
  belgeli: {
    label: 'Belgeli',
    type: Boolean,
    index: 1,
    defaultValue: false,
  },
  konsinye: {
    label: 'Konsinye',
    type: Boolean,
    index: 1,
    optional: true,
    autoValue() {
      const urun = this.field('urun');
      if (this.isSet && urun.isSet && !Urunler.findOne({_id: urun.value, stokTakipli: true})) {
        this.unset();
      }
      if (!this.isSet && urun.isSet && Urunler.findOne({_id: urun.value, stokTakipli: true})) {
        return false;
      }
    },
  },
  dosyaNo: {
    label: 'Dosya no',
    type: String,
    index: 1,
    optional: true,
    min: 1,
    max: 6,
    regEx: /^\d{1,6}$/,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '').replace(/\D+/g, '');
      }
    },
  },
  aciklama: {
    label: 'Açıklama',
    type: String,
    optional: true,
    max: 500,
    autoValue() {
      if (this.isSet) {
        return this.value.toTrimmed();
      }
    },
  },
});

export const helpers = function helpers() {
  return {
    createdBy() {
      return this.recordedBy ? Meteor.users.findOne(this.recordedBy).kullanici().isim() : 'Dragomanage Sistemi';
    },
    etiketLabels() {
      return Etiketler
        .find({_id: {$in: this.etiketler}}, {sort: {tip: 1, isim: 1}})
        .map(e => e.isim);
    },
    cariKartLabel() {
      const cariKart = CariKartlar.findOne(this.cariKart);
      return cariKart && `${cariKart.kisaIsim}${cariKart.unvan ? ` (${cariKart.unvan})`: ''}`;
    },
    konumLabel() {
      const konum = Konumlar.findOne(this.konum);
      return konum && konum.isim;
    },
    urunLabel() {
      const urun = Urunler.findOne(this.urun);
      return urun && urun.label();
    },
    sinifLabel() {
      const urun = Urunler.findOne(this.urun);
      return urun && urun.sinifLabel();
    },
    gerceklestirenLabel() {
      const kullanici = Kullanicilar.findOne(this.gerceklestiren);
      return kullanici && kullanici.isim();
    },
    urunFiyatLabel() {
      return (this.urunFiyat || 0).toCurrencyDisplay(2,this.urunKur);
    },
    urunOzelFiyatLabel() {
      return (this.urunOzelFiyat || 0).toCurrencyDisplay(2,this.urunKur);
    },
    urunFiyatLabelTL() {
      return ((this.urunFiyatX100TL || 0) / 100).toCurrencyDisplay();
    },
    urunOzelFiyatLabelTL() {
      return ((this.urunOzelFiyatX100TL || 0) / 100).toCurrencyDisplay();
    },
    tutarLabel() {
      return ((this.tutarX100 || 0) / 100).toCurrencyDisplay(2,this.kur);
    },
    tutarLabelTL() {
      return ((this.tutarX100TL || 0) / 100).toCurrencyDisplay();
    },
    kdvLabel() {
      return Number.isInteger(this.urunKdv) ? this.urunKdv.toString().enumValueToLabel(KDVLER) : undefined
    },
  };
}
