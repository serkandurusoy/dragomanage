import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { LIMIT } from '/imports/environment/meta';
import { GelirGider } from './shared/gelir-gider';
import { Gelirler as collection} from '/imports/api/model';
import { GelirModal as modal } from '/imports/client/modals';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

const extra = {
  selectorOptions,
  limit,
  subName: 'gelirler',
  modal,
  collection,
  title: 'Gelirler',
  dokumPath: 'Gelirler',
  sadeceGelireUygunUrunler: true,
};

export default function(props) {
  return <GelirGider {...props} {...extra} />
}

