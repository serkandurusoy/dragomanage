import '/imports/utils/number-utils';
import '/imports/utils/string-utils';
import '/imports/utils/date-utils';
import '/imports/environment/schema-globals';
import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOM from 'react-dom';
import store from 'store';
import WebFont from 'webfontloader';
import App from './app';
import './login-failure-handler';
import './account-cookie-handler';

let tabCount = 0;
const storeWithExpiration = {
  set(key, val, exp) {
    store.set(key, { val:val, exp:exp, time:new Date().getTime() });
  },
  get(key) {
    const info = store.get(key);
    if (!info) {
      return null;
    }
    if (new Date().getTime() - parseInt(info.time) > parseInt(info.exp)) {
      store.remove(key);
      return null;
    }
    return info.val
  }
};

Meteor.startup(() => {

  if (store.enabled) {
    const oldCountStored = storeWithExpiration.get('dmTabCount');
    const oldCount = oldCountStored ? parseInt(oldCountStored, 10) : 0;
    tabCount = oldCount + 1;
    tabCount = tabCount >= 5 ? 5 : tabCount;
    storeWithExpiration.set('dmTabCount', tabCount, 1 * 60 * 60 * 1000);
  }

  window.addEventListener("beforeunload", () => {
    /*if (store.enabled) {
      const oldCountStored = storeWithExpiration.get('dmTabCount');
      const oldCount = oldCountStored ? parseInt(oldCountStored, 10) : 0;
      tabCount = oldCount - 1;
      tabCount = tabCount <= 0 ? 0 : tabCount;
      storeWithExpiration.set('dmTabCount', tabCount, 1 * 60 * 60 * 1000);
    }
    if (tabCount <= 0) {
      if (Meteor.isProduction || (Meteor.isDevelopment && !store.get('noLogout'))) {
        Meteor.logout();
      }
    }*/
  });

  WebFont.load({
    google: {
      families: [
        'Roboto:300,400,500,700:latin,latin-ext',
      ],
    },
    timeout: 5000,
    events: false,
    classes: false,
  });

  ReactDOM.render(
    <App />,
    document.getElementById('react-root')
  );

});
