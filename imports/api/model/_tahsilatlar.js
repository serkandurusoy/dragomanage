import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { odemeTahsilat, helpers } from './shared/odeme-tahsilat';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';

export const Tahsilatlar = new Mongo.Collection('tahsilatlar');

Tahsilatlar.Schema = odemeTahsilat;

Tahsilatlar.attachSchema(Tahsilatlar.Schema);

Tahsilatlar.vermongo({timestamps: true, userId: 'recordedBy'});

Tahsilatlar.helpers(helpers.apply(this));
Tahsilatlar.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Tahsilatlar.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Tahsilatlar.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.etiketler) references = references.concat(doc.etiketler);
    if (doc.kasa) references.push(doc.kasa);
    if (doc.cariKart) references.push(doc.cariKart);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.TAHSILAT.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.islemTarihi.daysApartFromNow(),
      references,
    });
  });

  Tahsilatlar.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Tahsilat'];

    if (doc.tutarX100 === 0) {
      notes.push('iptal edildi')
    }

    let references = [doc._id];
    if (this.previous.etiketler) references = references.concat(this.previous.etiketler);
    if (doc.etiketler) references = references.concat(doc.etiketler);
    if (this.previous.kasa) references.push(this.previous.kasa);
    if (doc.kasa) references.push(doc.kasa);
    if (this.previous.cariKart) references.push(this.previous.cariKart);
    if (doc.cariKart) references.push(doc.cariKart);
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.TAHSILAT.value,
      doc: doc._id,
      operation: 'update',
      version: doc._version,
      note: notes.length > 1 ? notes.join(', ').concat('.') : undefined,
      daysFromInsert: doc.createdAt.daysApartFromNow(),
      daysFromUpdate: this.previous.modifiedAt.daysApartFromNow(),
      daysFromRecord: [
        doc.createdAt.daysApartFromNow(),
        doc.islemTarihi.daysApartFromNow(),
        this.previous.islemTarihi.daysApartFromNow(),
      ].sort().reverse()[0],
      references,
    });
  }, {fetchPrevious: true});

}
