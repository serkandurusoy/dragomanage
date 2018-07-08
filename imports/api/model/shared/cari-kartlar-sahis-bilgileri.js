import SimpleSchema from 'simpl-schema';
import {
  DILLER,
  ULKELER,
  CINSIYETLER,
  BEDENLER,
  SEKAYAK_SEVIYELERI,
  DALIS_SERTIFIKALARI,
  DALIS_SEVIYELERI,
} from '/imports/environment/enums';

export const sahisBilgileri = new SimpleSchema({
  pasaportVeyaTCNo: {
    label: 'Pasaport/TC No',
    type: String,
    optional: true,
    min: 5,
    max: 20,
    autoValue() {
      if (this.isSet) {
        return this.value.replace(/\s+/g, '');
      }
    },
  },
  uyruk: {
    label: 'Uyruk',
    type: String,
    optional: true,
    allowedValues: Object.keys(ULKELER).map(v => ULKELER[v].value),
  },
  diller: {
    label: 'Diller',
    type: Array,
  },
  'diller.$': {
    label: 'Diller',
    type: String,
    allowedValues: Object.keys(DILLER).map(v => DILLER[v].value),
  },
  cinsiyet: {
    label: 'Cinsiyet',
    type: String,
    optional: true,
    allowedValues: Object.keys(CINSIYETLER).map(v => CINSIYETLER[v].value),
  },
  dogumTarihi: {
    label: 'Doğum tarihi',
    type: Date,
    max: Date.yesterday(),
    optional: true,
  },
  beden: {
    label: 'Beden',
    type: String,
    optional: true,
    allowedValues: Object.keys(BEDENLER).map(v => BEDENLER[v].value),
  },
  ayak: {
    label: 'Ayak',
    type: Number,
    min: 34,
    max: 48,
    optional: true,
  },
  seakayakSeviyesi: {
    label: 'Seakayak seviyesi',
    type: String,
    optional: true,
    allowedValues: Object.keys(SEKAYAK_SEVIYELERI).map(v => SEKAYAK_SEVIYELERI[v].value),
  },
  dalisSertifikasi: {
    label: 'Dalış sertifikası',
    type: String,
    optional: true,
    allowedValues: Object.keys(DALIS_SERTIFIKALARI).map(v => DALIS_SERTIFIKALARI[v].value),
  },
  dalisSeviyesi: {
    label: 'Dalış seviyesi',
    type: String,
    optional: true,
    allowedValues: Object.keys(DALIS_SEVIYELERI).map(v => DALIS_SEVIYELERI[v].value),
  },
  sonDalisTarihi: {
    label: 'Son dalış tarihi',
    type: Date,
    max: Date.yesterday(),
    optional: true,
  },
  toplamDalisSayisi: {
    label: 'Toplam dalış sayısı',
    type: Number,
    min: 0,
    max: 10000,
    optional: true,
  },
  aktiviteNotlari: {
    label: 'Aktivite notları',
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
