import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { JsonRoutes } from 'meteor/simple:json-routes';
import Excel from 'exceljs';
import cookieParser from 'cookie-parser';
import CookieDough from 'cookie-dough';
import { COLLECTIONS } from '/imports/environment/meta';
import * as dokumler from './dokumler';

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

            JsonRoutes.setResponseHeaders({
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment;`,
            });

            let wb = new Excel.Workbook();
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
            wb.xlsx.write(res)
              .then(() => {
                JsonRoutes.sendResult(res);
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
