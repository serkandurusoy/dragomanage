import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Kurlar } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('kurlar', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.PUBLIC.value);
  if (yetkili) {
    return [
      Kurlar.find({tarih: {$gte: Date.sistemAcilis()}}),
    ];
  } else {
    this.ready();
  }
});
