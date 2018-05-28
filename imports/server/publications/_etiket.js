import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Etiketler } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('etiket', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.TANIMLAR.value);
  if (yetkili) {
    return [
      Etiketler.find(args._id),
      Etiketler.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('etiketler', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {
    return [
      Etiketler.find(),
    ];
  } else {
    this.ready();
  }
});
