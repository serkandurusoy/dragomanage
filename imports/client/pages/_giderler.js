import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { LIMIT } from '/imports/environment/meta';
import { GelirGider } from './shared/gelir-gider';
import { Giderler as collection} from '/imports/api/model';
import { GiderModal as modal } from '/imports/client/modals';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

const extra = {
  selectorOptions,
  limit,
  subName: 'giderler',
  modal,
  collection,
  title: 'Giderler',
  dokumPath: 'Giderler',
  sadeceGidereUygunUrunler: true,
};

export default function(props) {
  return <GelirGider {...props} {...extra} />
}

