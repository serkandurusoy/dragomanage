import { Meteor } from 'meteor/meteor';
import { Bakiye } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';

Meteor.publish('bakiyeler', function() {
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
  if (yetkili) {
    return [
      Bakiye.Stok.find({adet: {$ne: 0}}),
      Bakiye.Stok.Acilis.find(),
      Bakiye.Cari.find({tutarX100: {$ne: 0}}),
      Bakiye.Cari.Acilis.find(),
      Bakiye.Kasa.find({tutarX100: {$ne: 0}}),
      Bakiye.Kasa.Acilis.find(),
    ];
  } else {
    this.ready();
  }
});
