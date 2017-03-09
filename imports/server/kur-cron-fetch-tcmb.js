import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { parseString } from 'xml2js';
import { Kurlar } from '/imports/api/model';
import { KURLAR } from '/imports/environment/enums';
import moment from 'moment-timezone';
import { Promise } from 'meteor/promise';

Meteor.startup(() => {

  Kurlar.remove({tarih: { $gte: Date.today().subtract(7, 'd') }});

  const datesToCheck = Array.from(
    {
      length: moment
        .duration(moment()-moment('20161230'))
        .asDays()
      + 2
    }, (_,ix) =>
      moment('20161230')
        .add(ix,'d')
        .toDate()
  );

  if (datesToCheck.length !== Kurlar.find().count()) {
    let existingTarih = [];

    datesToCheck.forEach(d => {
      if ( Kurlar.findOne({tarih: d}) ) {
        existingTarih.push(moment(d).format('YYYYMM/DDMMYYYY'));
      }
    });

    const missingTarih = datesToCheck.filter(d => !existingTarih.find(t => moment(d).isSame(moment(t, 'YYYYMM/DDMMYYYY'))));

    missingTarih.forEach(t => {
      fetchTCMB(moment(t).format('YYYYMM/DDMMYYYY'));
    })
  }

});

SyncedCron.add({
  name: 'Refresh TCMB for today',
  schedule(parser) {
    return parser.recur().every(5).minute().after('12:01').time().before('14:31').time();
  },
  job() {
    fetchTCMB('today');
  }
});

function fetchTCMB(dateString, forTarih) {
  try {
    const res = HTTP.get(`http://www.tcmb.gov.tr/kurlar/${dateString}.xml`);
    if (res.statusCode === 200) {
      try {
        const kurObject = Promise.await(parseTCMB(res.content));
        insertTCMB(kurObject, forTarih || dateString);
      } catch (e) {
        console.log('TCMB PARSING ERROR', e)
      }
    }
  } catch(e) {
    const tryNewDate = moment(dateString, 'YYYYMM/DDMMYYYY').subtract(1, 'd').format('YYYYMM/DDMMYYYY');
    fetchTCMB(tryNewDate, forTarih || dateString);
  }
}

function insertTCMB(kurObject, dateString) {
  insertKur(kurObject, dateString === 'today' ? Date.today() : moment(dateString, 'YYYYMM/DDMMYYYY').toDate());
  if (dateString === 'today') {
    insertKur(kurObject, Date.tomorrow());
  }
}

function insertKur(kurObject, forTarih) {
  Kurlar.upsert({
    tarih: forTarih,
  }, {
    $set: {
      tarih: forTarih,
      [KURLAR.USD.value]: kurObject[KURLAR.USD.value],
      [KURLAR.EUR.value]: kurObject[KURLAR.EUR.value],
      [KURLAR.GBP.value]: kurObject[KURLAR.GBP.value],
      tarihYayin: kurObject.tarih,
    }
  })
}

function parseTCMB(content) {
  return new Promise((resolve, reject) => {
    parseString(content, {
      attrkey: 'attributes',
      tagNameProcessors: [prettyName],
      attrNameProcessors: [prettyName],
      valueProcessors: [valueProcessors],
      trim: true,
      explicitArray: false,
      emptyTag: null,
    }, (err, res) => {
      if (err) {
        reject(err);
      }

      const tarihArray = res
        .tarihDate
        .attributes
        .tarih
        .split('.')
        .reverse()
        .map(part =>
          parseInt(part,10)
        );

      const kurObject = {
        tarih: new Date(tarihArray),
      };

      const kurlar = res
        .tarihDate
        .currency
        .filter(kur =>
          Object.keys(KURLAR)
            .map(kur => KURLAR[kur].value)
            .includes(kur.attributes.kod)
        )
        .map(kur => {
          return {
            kod: kur.attributes.kod,
            kur: kur.forexSelling,
          };
        });


      kurlar.forEach(kur => kurObject[kur.kod] = kur.kur);

      resolve(kurObject);
    })
  })
}

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function prettyName(name) {
  return lowerCaseFirstLetter(name).replace(/[-_]+(.)?/g, g => g[1].toUpperCase() );
}

function valueProcessors(val) {
  if (val) {
    const floatVal = parseFloat(val);
    if(isNaN(floatVal)) {
      return val;
    }
    return floatVal;
  }
}
