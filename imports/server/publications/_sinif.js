import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Siniflar } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('sinif', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.TANIMLAR.value);
  if (yetkili) {
    return [
      Siniflar.find(args._id),
      Siniflar.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('siniflar', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {
    return [
      Siniflar.find(),
    ];
  } else {
    this.ready();
  }
});
