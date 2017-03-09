import { COLLATION_SORT_KEYS } from './collation-sort-keys';

export default function collate(collection, fields=[], precision=10) {
  if (
    collection
    && fields.length > 0
  ) {

    collection.before.insert(function(userId,doc) {
      fields.forEach(field => {
        doc[`${field}Collate`] = getSortKey(doc[field], precision);
      });
    });

    collection.before.update(function(userId, doc, fieldNames, modifier, options) {
      const modifierSetValues = modifier.$set;
      if (modifierSetValues) {
        fields.forEach(field => {
          const fieldVal = modifierSetValues[field];
          if (fieldVal || fieldVal === '') {
            modifier.$set[`${field}Collate`] = getSortKey(fieldVal, precision);
          }
        });
      }
      const modifierUnSetValues = modifier.$unset;
      if (modifierUnSetValues) {
        fields.forEach(field => {
          const fieldVal = modifierUnSetValues[field];
          if (fieldVal || fieldVal === '') {
            modifier.$unset[`${field}Collate`] = '';
          }
        });
      }
    });

  }
}

function getSortKey(text='', precision=10) {
  return text
    .toString()
    .substr(0, precision)
    .split('')
    .map(c =>
      Object.keys(COLLATION_SORT_KEYS).includes(c)
        ? COLLATION_SORT_KEYS[c]
        : COLLATION_SORT_KEYS["0"]
    )
    .join('');
}
