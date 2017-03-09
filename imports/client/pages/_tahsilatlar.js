import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { LIMIT } from '/imports/environment/meta';
import { OdemeTahsilat } from './shared/odeme-tahsilat';
import { Tahsilatlar as collection} from '/imports/api/model';
import { TahsilatModal as modal } from '/imports/client/modals';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

const extra = {
  selectorOptions,
  limit,
  subName: 'tahsilatlar',
  modal,
  collection,
  title: 'Tahsilatlar',
  dokumPath: 'Tahsilatlar',
};

export default function(props) {
  return <OdemeTahsilat {...props} {...extra} />
}

