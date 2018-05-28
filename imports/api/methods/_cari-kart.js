import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ValidationError } from 'meteor/mdg:validation-error';
import { CARI_KARTLAR } from '/imports/environment/enums';
import { YETKILER } from '/imports/environment/meta';
import docToModifier from '/imports/utils/doc-to-modifier';
import methodMixinYetki from '/imports/utils/method-mixin-yetki';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import { CariKartlar } from '/imports/api/model';

export const cariKart = {

  select: new ValidatedMethod({

    name: 'cariKart.select',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.PUBLIC],

    validate: new SimpleSchema({
      keyword: {
        type: String,
      },
    }).validator({clean: true}),

    run({keyword}) {
      const selector = buildKeywordRegexSelector(keyword, ['unvan','kisaIsim'], {});
      return CariKartlar.find(selector, {sort: {kisaIsim: 1}}).map(cariKart => ({
        value: cariKart._id,
        label: `${cariKart.kisaIsim}${cariKart.unvan ? ` (${cariKart.unvan})`: ''}`,
      }));
    }

  }),

  insert: new ValidatedMethod({

    name: 'cariKart.insert',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.CARI_KARTLAR],

    validate: CariKartlar.Schema.validator({clean: true}),

    run(doc) {

      if (!this.isSimulation) {
        let selector = {
          $or: [
            { kisaIsim: doc.kisaIsim},
          ],
        };
        if (doc.unvan) {
          selector.$or = selector.$or.concat([{ unvan: doc.unvan}]);
        }
        const cariKart = CariKartlar.findOne(selector);
        if (cariKart) {
          throw new ValidationError([
            {
              name: cariKart.kisaIsim === doc.kisaIsim ? 'kisaIsim' : 'unvan',
              type: 'notUnique',
              value: cariKart.kisaIsim === doc.kisaIsim ? doc.kisaIsim : doc.unvan,
            }
          ]);
        }
      }

      if (doc.tip !== CARI_KARTLAR.SAHIS.value) {
        delete doc.sahisBilgileri;
      }

      return CariKartlar.insert(doc);

    },

  }),

  update: new ValidatedMethod({

    name: 'cariKart.update',

    mixins: [methodMixinYetki],

    yetkiler: [YETKILER.CARI_KARTLAR],

    validate: new SimpleSchema({
      _id: {
        type: String,
      },
      doc: {
        type: CariKartlar.Schema,
      },
    }).validator({clean: true}),

    run({_id, doc}) {

      if (!this.isSimulation) {
        let selector = {
          $or: [
            { kisaIsim: doc.kisaIsim},
          ],
        };
        if (doc.unvan) {
          selector.$or = selector.$or.concat([{ unvan: doc.unvan}]);
        }
        selector._id = { $ne: _id };
        const cariKart = CariKartlar.findOne(selector);
        if (cariKart) {
          throw new ValidationError([
            {
              name: cariKart.kisaIsim === doc.kisaIsim ? 'kisaIsim' : 'unvan',
              type: 'notUnique',
              value: cariKart.kisaIsim === doc.kisaIsim ? doc.kisaIsim : doc.unvan,
            }
          ]);
        }
      }

      const modifier = docToModifier(CariKartlar.Schema, doc);

      return CariKartlar.update(_id, modifier);

    },

  }),

}

