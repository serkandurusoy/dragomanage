import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Markalar } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('marka', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.URUNLER.value);
  if (yetkili) {
    return [
      Markalar.find(args._id),
      Markalar.findOne(args._id).versions(),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('markalar', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.URUNLER.value);
  if (yetkili) {
    return [
      Markalar.find(),
    ];
  } else {
    this.ready();
  }
});
