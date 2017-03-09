import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';

SyncedCron.options = {
  log: false,
  collectionName: 'cronHistory',
  utc: true,
  collectionTTL: 657000
};

Meteor.startup(function() {
  SyncedCron.start();
});
