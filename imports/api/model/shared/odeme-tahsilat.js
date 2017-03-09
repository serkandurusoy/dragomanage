import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { CariKartlar, Kasalar, Kullanicilar, Etiketler, Kurlar } from '../';
import { ETIKETLER, KURLAR, KASALAR } from '/imports/environment/enums';

export const odemeTahsilat = new SimpleSchema({
  etiketler: {
    label: 'Etiketler',
    type: [String],
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
      if (islemTarihi.isSet && kurCinsi.isSet) {
        const kur = Kurlar.findOne({tarih: islemTarihi.value})[kurCinsi.value];
        return Math.round(kur * ((tutar.value || 0) * 100 + (tutarKurus.value || 0)));
      }
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
  kasa: {
    label: 'Kasa',
    type: String,
    index: 1,
    custom() {
      const kur = this.field('kur');
      if (this.isSet && kur.isSet && !!this.value && Kasalar.findOne({_id: this.value, kur: kur.value, aktif: false})) {
        return 'hasInactiveValue';
      }
      if (this.isSet && kur.isSet && !!this.value && !Kasalar.findOne({_id: this.value, kur: kur.value})) {
        return 'kasaKuruHatali';
      }
      const islemTarihi = this.field('islemTarihi');
      const vadeTarihi = this.field('vadeTarihi');
      if (this.isSet && islemTarihi.isSet && vadeTarihi.isSet) {
        const vadeliIslem = vadeTarihi.value.isAfter(islemTarihi.value);
        const vadeliKasa = Kasalar.findOne(this.value).tip === KASALAR.CEK_SENET.value;
        if (vadeliIslem && !vadeliKasa) {
          return 'kasaVadesiHatali';
        }
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
    min: Date.sistemAcilis().isSameOrBefore(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter(),
    max: Date.inTwoYears(),
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
    kasaLabel() {
      const kasa = Kasalar.findOne(this.kasa);
      return kasa && kasa.isim;
    },
    gerceklestirenLabel() {
      const kullanici = Kullanicilar.findOne(this.gerceklestiren);
      return kullanici && kullanici.isim();
    },
    tutarLabel() {
      return ((this.tutarX100 || 0) / 100).toCurrencyDisplay(2,this.kur);
    },
    tutarLabelTL() {
      return ((this.tutarX100TL || 0) / 100).toCurrencyDisplay();
    },
  };
}
