import React, { Component } from 'react';
import { Gelirler } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { gelir as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';
import Kart from './shared/gelir-gider';

export const GelirModal = (props) => <BaseModal
  kart={Kart}
  collection={Gelirler}
  schema={props.operation === 'update' && new SimpleSchema([Gelirler.Schema, iptalOnayiSchema])}
  subscription="gelir"
  formMethod={formMethod}
  title="Gelir"
  sadeceGelireUygunUrunler={true}
  sadeceSatilabilirUrunler={true}
  {...props}
/>;
