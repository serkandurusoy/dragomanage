import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { COLLECTIONS } from '/imports/environment/meta';
import { Timeline } from './_timeline';
import { gelirGider, helpers } from './shared/gelir-gider';

export const Giderler = new Mongo.Collection('giderler');

Giderler.Schema = gelirGider;

Giderler.attachSchema(Giderler.Schema);

Giderler.vermongo({timestamps: true, userId: 'recordedBy'});

Giderler.helpers(helpers.apply(this));
Giderler.getVersionCollection().helpers(helpers.apply(this));

if (Meteor.isServer) {
  Giderler.getVersionCollection().rawCollection().createIndex({ ref: 1, _version: -1 }, { unique: true });
}

if (Meteor.isServer) {

  Giderler.after.insert(function(userId, doc) {
    let references = [doc._id];
    if (doc.etiketler) references = references.concat(doc.etiketler);
    if (doc.konum) references.push(doc.konum);
    if (doc.cariKart) references.push(doc.cariKart);
    if (doc.urun) references.push(doc.urun);
    if (doc.dosyaNo) references.push(doc.dosyaNo);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.GIDER.value,
      doc: doc._id,
      operation: 'insert',
      version: doc._version,
      daysFromRecord: doc.islemTarihi.daysApartFromNow(),
      references,
    });
  });

  Giderler.after.update(function(userId, doc, fieldNames, modifier, options) {
    let notes = ['Gider'];

    if (doc.tutarX100 === 0) {
      notes.push('iptal edildi')
    }

    let references = [doc._id];
    if (this.previous.etiketler) references = references.concat(this.previous.etiketler);
    if (doc.etiketler) references = references.concat(doc.etiketler);
    if (this.previous.konum) references.push(this.previous.konum);
    if (doc.konum) references.push(doc.konum);
    if (this.previous.cariKart) references.push(this.previous.cariKart);
    if (doc.cariKart) references.push(doc.cariKart);
    if (this.previous.urun) references.push(this.previous.urun);
    if (doc.urun) references.push(doc.urun);
    if (this.previous.dosyaNo) references.push(this.previous.dosyaNo);
    if (doc.dosyaNo) references.push(doc.dosyaNo);
    references = references
      .filter(r => !!r)
      .filter((r,ix,arr) => arr.indexOf(r) === ix);

    Timeline.insert({
      recordedBy: userId,
      collection: COLLECTIONS.GIDER.value,
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
