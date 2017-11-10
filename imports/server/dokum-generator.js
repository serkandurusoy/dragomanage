import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { JsonRoutes } from 'meteor/simple:json-routes';
import Excel from 'exceljs';
import cookieParser from 'cookie-parser';
import CookieDough from 'cookie-dough';
import { COLLECTIONS } from '/imports/environment/meta';
import * as dokumler from './dokumler';

import { Webapp } from 'meteor/webapp';

// very ugly hack to increase timeout to temporarily solve xls generation timeout problems
// proper fix would be to stream the file using the streaming i/o interface from exceljs
// TODO: https://github.com/guyonroche/exceljs#streaming-io
WebApp.httpServer.on('request', function (req, res) {
  req.setTimeout(10 * 120 * 1000);
  const finishListeners = res.listeners('finish');
  res.removeAllListeners('finish');
  res.on('finish', function () {
    res.setTimeout(5 * 1000);
  });
  finishListeners.forEach(function (l) { res.on('finish', l); });
});

JsonRoutes.Middleware.use(cookieParser());

JsonRoutes.add('get', '/dokumler/:dokumAdi', (req, res, next) => {
  try {
    const dokumAdlari = Object.keys(COLLECTIONS).map(v => COLLECTIONS[v].value);
    const dokumCollection = req.params.dokumAdi && req.params.dokumAdi.split('-')[0];
    if (dokumCollection && dokumAdlari.includes(dokumCollection) && dokumler[dokumCollection]) {
      const cookie = new CookieDough(req);
      const loginToken = cookie.get('dragomanage');
      if (loginToken) {
        const hashedToken = Accounts._hashLoginToken(loginToken);
        const user = Meteor.users.findOne({
          'services.resume.loginTokens.hashedToken': hashedToken,
        });
        const yetki = Object.keys(COLLECTIONS)
          .map(v => COLLECTIONS[v])
          .find(v => v.value === dokumCollection)
          .yetki;
        if (user && user.yetkili(yetki)) {
          try {

            res.writeHead(200, {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': 'attachment;',
              'Transfer-Encoding': 'chunked',
              'Connection': 'Transfer-Encoding',
              'X-Content-Type-Options': 'nosniff',
            });

            let wb = new Excel.stream.xlsx.WorkbookWriter({
              useStyles: true,
              useSharedStrings: true,
            });
            wb.stream.pipe(res);

            const label = Object.keys(COLLECTIONS)
              .map(v => COLLECTIONS[v])
              .find(v => v.value === dokumCollection)
              .label;
            let ws = wb.addWorksheet(`${label} dökümü`);
            ws.pageSetup = {
              paperSize: 9,
              orientation:'landscape',
              fitToWidth: 1,
            };
            ws.views = [
              {state: 'frozen', xSplit: 0, ySplit: 1}
            ];
            dokumler[dokumCollection](ws);
            ws.commit();
            wb.commit().then(() => {
              res.end();
            });
          } catch (e) {
            JsonRoutes.sendResult(res, {code: 404});
          }
        } else {
          JsonRoutes.sendResult(res, {code: 404});
        }
      }
      else {
        JsonRoutes.sendResult(res, {code: 404});
      }
    } else {
      JsonRoutes.sendResult(res, {code: 404});
    }
  } catch (e) {
    JsonRoutes.sendResult(res, {code: 404});
  }
});
