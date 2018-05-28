import SimpleSchema from 'simpl-schema';
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
    autoValue() {
      return 1;
    }
  },
  [KURLAR.USD.value]: {
    type: Number,
  },
  [KURLAR.EUR.value]: {
    type: Number,
  },
  [KURLAR.GBP.value]: {
    type: Number,
  },
});

Kurlar.attachSchema(Kurlar.Schema);
