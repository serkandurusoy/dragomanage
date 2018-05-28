import React, { Component } from 'react';
import { Tahsilatlar } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { tahsilat as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';
import Kart from './shared/odeme-tahsilat';
import SimpleSchema from 'simpl-schema';

export const TahsilatModal = (props) => <BaseModal
  kart={Kart}
  collection={Tahsilatlar}
  schema={props.operation === 'update' && new SimpleSchema(Tahsilatlar.Schema).extend(iptalOnayiSchema)}
  subscription="tahsilat"
  formMethod={formMethod}
  title="Tahsilat"
  {...props}
/>;
