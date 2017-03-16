import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import createKullaniciFixture from './_kullanici';
import createKasaFixture from './_kasa';
import createUrunFixture from './_urun';
import createCariKartFixture from './_cari-kart';
import createMusteriFixture from './_musteri';
import createGiderFixture from './_gider';

import resetTimestamps from './_reset-timestamps';

import updateProductionUrunFiyat from './_update-production-urun-fiyat';

const Migrations = new Mongo.Collection('migrations');
const MIGRATION_VERSION = 2;

if (Meteor.isDevelopment) {

  Meteor.startup(() => {

    const lastMigration = Migrations.findOne({}, {sort: {date: -1}});

    if (!lastMigration || lastMigration.version < MIGRATION_VERSION) {

      // Migration version 1
      // createKullaniciFixture();
      // createKasaFixture();
      // createMusteriFixture();
      // createCariKartFixture();
      // createUrunFixture();
      // createGiderFixture();
      //
      // resetTimestamps();

      // Migration version 2
      // updateProductionUrunFiyat();

      // Migrations.insert({
      //   version: MIGRATION_VERSION,
      //   date: new Date(),
      // });

    }

  });

}
