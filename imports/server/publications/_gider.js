import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Giderler, CariKartlar, Urunler } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';
import { selectorSchema, buildSelector } from './shared/gelir-gider';

Meteor.publish('gider', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
  if (yetkili) {
    return [
      Giderler.find(args._id),
      Giderler.findOne(args._id).versions(),
      CariKartlar.find(Giderler.findOne(args._id).cariKart),
      Urunler.find(Giderler.findOne(args._id).urun),
    ];
  } else {
    this.ready();
  }
});

Meteor.publishComposite('giderler', function(args) {
  selectorSchema.validate(args);
  this.unblock();

  return {
    find() {
      const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
      if (yetkili) {

        let selector = buildSelector(args);

        return Giderler.find(selector, {
          sort: {islemTarihi: -1, vadeTarihi: -1, createdAt: -1},
          limit: args.limit,
        });
      }
    },
    children: [
      {
        find(gider) {
          return CariKartlar.find(gider.cariKart);
        }
      },
      {
        find(gider) {
          return Urunler.find(gider.urun);
        }
      },
    ]
  }

});
