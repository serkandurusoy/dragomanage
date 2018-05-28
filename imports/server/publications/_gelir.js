import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Gelirler, CariKartlar, Urunler } from '/imports/api/model';
import { YETKILER } from '/imports/environment/meta';
import { selectorSchema, buildSelector } from './shared/gelir-gider';

Meteor.publish('gelir', function(args) {
  new SimpleSchema({
    _id: {
      type: String,
    },
  }).validate(args);
  this.unblock();
  const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
  if (yetkili) {
    return [
      Gelirler.find(args._id),
      Gelirler.findOne(args._id).versions(),
      CariKartlar.find(Gelirler.findOne(args._id).cariKart),
      Urunler.find(Gelirler.findOne(args._id).urun),
    ];
  } else {
    this.ready();
  }
});

Meteor.publishComposite('gelirler', function(args) {
  selectorSchema.validate(args);
  this.unblock();

  return {
    find() {
      const yetkili = this.userId && Meteor.users.findOne(this.userId).yetkili(YETKILER.MUHASEBE.value);
      if (yetkili) {

        let selector = buildSelector(args);

        return Gelirler.find(selector, {
          sort: {islemTarihi: -1, vadeTarihi: -1, createdAt: -1},
          limit: args.limit,
        });
      }
    },
    children: [
      {
        find(gelir) {
          return CariKartlar.find(gelir.cariKart);
        }
      },
      {
        find(gelir) {
          return Urunler.find(gelir.urun);
        }
      },
    ]
  }

});
