import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Timeline } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('timeline', function(args) {
  new SimpleSchema({
    selectorOptions: {
      type: Object,
    },
    'selectorOptions.reference': {
      type: String,
      optional: true,
    },
    'selectorOptions.collection': {
      type: String,
      optional: true,
    },
    'selectorOptions.operation': {
      type: String,
      optional: true,
    },
    'selectorOptions.recordedBy': {
      type: String,
      optional: true,
    },
    'selectorOptions.recordedAtBegin': {
      type: Date,
      optional: true,
    },
    'selectorOptions.recordedAtEnd': {
      type: Date,
      optional: true,
    },
    limit: {
      type: Number,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {

    let selector = {};
    let options = args.selectorOptions;
    Object.keys(args.selectorOptions).forEach(o => !options[o] && delete options[o]);

    if (Object.keys(options).length > 0) {
      selector.$and = [];

      if (options.reference) {
        selector.$and.push({ references: options.reference });
      }

      if (options.collection) {
        selector.$and.push({ collection: options.collection });
      }

      if (options.operation) {
        selector.$and.push({ operation: options.operation });
      }

      if (options.recordedBy) {
        selector.$and.push({ recordedBy: options.recordedBy });
      }

      if (options.recordedAtBegin) {
        selector.$and.push({ recordedAt: { $gte: options.recordedAtBegin} });
      }

      if (options.recordedAtEnd) {
        selector.$and.push({ recordedAt: { $lte: options.recordedAtEnd.add(1,'d')} });
      }

    }

    return [
      Timeline.find(selector, {
        sort: {recordedAt: -1, collection: 1, operation: 1, references: 1},
        limit: args.limit,
      }),
    ];
  } else {
    this.ready();
  }
});
