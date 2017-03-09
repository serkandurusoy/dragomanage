import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { LIMIT } from '/imports/environment/meta';
import { OdemeTahsilat } from './shared/odeme-tahsilat';
import { Odemeler as collection} from '/imports/api/model';
import { OdemeModal as modal } from '/imports/client/modals';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

const extra = {
  selectorOptions,
  limit,
  subName: 'odemeler',
  modal,
  collection,
  title: 'Ödemeler',
  dokumPath: 'Odemeler',
};

export default function(props) {
  return <OdemeTahsilat {...props} {...extra} />
}

