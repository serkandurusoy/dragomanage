import SimpleSchema from 'simpl-schema';

export const selectorSchema = new SimpleSchema({
  selectorOptions: {
    type: Object,
  },
  'selectorOptions.cariKart': {
    type: String,
    optional: true,
  },
  'selectorOptions.urun': {
    type: String,
    optional: true,
  },
  /*'selectorOptions.dosyaNo': {
    type: String,
    optional: true,
  },*/
  'selectorOptions.vadeTarihi': {
    type: Date,
    optional: true,
  },
  'selectorOptions.gerceklestiren': {
    type: String,
    optional: true,
  },
  'selectorOptions.islemTarihiBegin': {
    type: Date,
    optional: true,
  },
  'selectorOptions.islemTarihiEnd': {
    type: Date,
    optional: true,
  },
  'selectorOptions.etiketler': {
    type: Array,
    optional: true,
  },
  'selectorOptions.etiketler.$': {
    type: String,
  },
  'selectorOptions.iptal': {
    type: Boolean,
    optional: true,
  },
  limit: {
    type: Number,
  },
});

export const buildSelector = function(args) {
  let selector = {};
  let options = args.selectorOptions;
  Object.keys(args.selectorOptions).forEach(o => (
      typeof options[o] === 'undefined' ||
      options[o] === ''
    ) && delete options[o]
  );

  if (Object.keys(options).length > 0) {
    selector.$and = [];

    if (options.etiketler && options.etiketler.length > 0) {
      selector.$and.push({
        etiketler : {
          $in: options.etiketler,
        }
      })
    }

    if (typeof options.iptal === 'boolean') {
      let compare = {};
      if (options.iptal) {
        compare.$eq = 0;
      } else {
        compare.$gt = 0;
      }
      selector.$and.push({ tutarX100: compare });
    }

    if (options.cariKart) {
      selector.$and.push({ cariKart: options.cariKart });
    }

    if (options.gerceklestiren) {
      selector.$and.push({ gerceklestiren: options.gerceklestiren });
    }

    if (options.urun) {
      selector.$and.push({ urun: options.urun });
    }

    /*if (options.dosyaNo) {
      selector.$and.push({ dosyaNo: options.dosyaNo });
    }*/
    if (options.vadeTarihi) {
      selector.$and.push({ vadeTarihi: { $lte: options.vadeTarihi.add(1,'d')} });
    }

    if (options.islemTarihiBegin) {
      selector.$and.push({ islemTarihi: { $gte: options.islemTarihiBegin} });
    }

    if (options.islemTarihiEnd) {
      selector.$and.push({ islemTarihi: { $lte: options.islemTarihiEnd.add(1,'d')} });
    }

  }

  if (selector.$and && selector.$and.length === 0) {
    selector = {};
  }

  return selector;
}
