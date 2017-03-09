import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Konumlar } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('konum', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.TANIMLAR.value);
  if (yetkili) {
    return [
      Konumlar.find(args._id),
      Konumlar.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('konumlar', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {
    return [
      Konumlar.find(),
    ];
  } else {
    this.ready();
  }
});
