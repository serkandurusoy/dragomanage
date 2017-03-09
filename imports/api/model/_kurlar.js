import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { KURLAR } from '/imports/environment/enums';

export const Kurlar = new Mongo.Collection('kurlar');

Kurlar.Schema = new SimpleSchema({
  tarihYayin: {
    type: Date,
    index: 1,
  },
  tarih: {
    type: Date,
    index: -1,
    unique: true,
  },
  [KURLAR.TRY.value]: {
    type: Number,
    decimal: true,
    autoValue() {
      return 1;
    }
  },
  [KURLAR.USD.value]: {
    type: Number,
    decimal: true,
  },
  [KURLAR.EUR.value]: {
    type: Number,
    decimal: true,
  },
  [KURLAR.GBP.value]: {
    type: Number,
    decimal: true,
  },
});

Kurlar.attachSchema(Kurlar.Schema);
