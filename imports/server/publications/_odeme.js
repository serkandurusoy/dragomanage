import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Odemeler, CariKartlar } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';
import { selectorSchema, buildSelector } from './shared/odeme-tahsilat';

Meteor.publish('odeme', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
  if (yetkili) {
    return [
      Odemeler.find(args._id),
      Odemeler.findOne(args._id).versions(),
      CariKartlar.find(Odemeler.findOne(args._id).cariKart),
    ];
  } else {
    this.ready();
  }
});

Meteor.publishComposite('odemeler', function(args) {
  selectorSchema.validate(args);
  this.unblock();

  return {
    find() {
      const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
      if (yetkili) {

        let selector = buildSelector(args);

        return Odemeler.find(selector, {
          sort: {islemTarihi: -1, vadeTarihi: -1, createdAt: -1},
          limit: args.limit,
        });
      }
    },
    children: [
      {
        find(odeme) {
          return CariKartlar.find(odeme.cariKart);
        }
      }
    ]
  }

});
