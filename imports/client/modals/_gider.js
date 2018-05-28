import React, { Component } from 'react';
import { Giderler } from '/imports/api/model';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { gider as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';
import Kart from './shared/gelir-gider';
import SimpleSchema from 'simpl-schema';

export const GiderModal = (props) => <BaseModal
  kart={Kart}
  collection={Giderler}
  schema={props.operation === 'update' && new SimpleSchema(Giderler.Schema).extend(iptalOnayiSchema)}
  subscription="gider"
  formMethod={formMethod}
  title="Gider"
  sadeceGidereUygunUrunler={true}
  {...props}
/>;
