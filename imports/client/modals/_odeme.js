import React, { Component } from 'react';
import { Odemeler } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { odeme as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';
import Kart from './shared/odeme-tahsilat';

export const OdemeModal = (props) => <BaseModal
  kart={Kart}
  collection={Odemeler}
  schema={props.operation === 'update' && new SimpleSchema([Odemeler.Schema, iptalOnayiSchema])}
  subscription="odeme"
  formMethod={formMethod}
  title="Ödeme"
  {...props}
/>;
