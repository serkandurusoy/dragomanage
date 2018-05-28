import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Kasalar } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('kasa', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.TANIMLAR.value);
  if (yetkili) {
    return [
      Kasalar.find(args._id),
      Kasalar.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('kasalar', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {
    return [
      Kasalar.find(),
    ];
  } else {
    this.ready();
  }
});
