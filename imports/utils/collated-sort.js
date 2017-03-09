import { Meteor } from 'meteor/meteor';

export default function collatedSort(collection, fields=[]) {

  if (
    collection
    && fields.length > 0
  ) {

    if (Meteor.isServer) {
      fields.forEach(field => {
        collection.rawCollection().createIndex({ [`${field}Collate`]: 1 });
      });
    }

    collection.before.find(adjustSortAndProjection.bind(this,fields));
    collection.before.findOne(adjustSortAndProjection.bind(this,fields));

  }

}

function adjustSortAndProjection(fields, userId, selector, options) {
  const sortKeys = options && options.sort;
  if (sortKeys) {
    fields.forEach(field => {
      if (sortKeys[field]) {
        options.sort[`${field}Collate`] = sortKeys[field];
        delete options.sort[field];
      }
    });
  }
  const projectionKeys = options && options.fields;
  if (projectionKeys) {
    fields.forEach(field => {
      if (projectionKeys[field]) {
        options.fields[`${field}Collate`] = projectionKeys[field];
      }
    });
  }
}
