import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Tahsilatlar, CariKartlar } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';
import { selectorSchema, buildSelector } from './shared/odeme-tahsilat';

Meteor.publish('tahsilat', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
  if (yetkili) {
    return [
      Tahsilatlar.find(args._id),
      Tahsilatlar.findOne(args._id).versions(),
      CariKartlar.find(Tahsilatlar.findOne(args._id).cariKart),
    ];
  } else {
    this.ready();
  }
});

Meteor.publishComposite('tahsilatlar', function(args) {
  selectorSchema.validate(args);
  this.unblock();

  return {
    find() {
      const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
      if (yetkili) {

        let selector = buildSelector(args);

        return Tahsilatlar.find(selector, {
          sort: {islemTarihi: -1, vadeTarihi: -1, createdAt: -1},
          limit: args.limit,
        });
      }
    },
    children: [
      {
        find(tahsilat) {
          return CariKartlar.find(tahsilat.cariKart);
        }
      }
    ]
  }

});
