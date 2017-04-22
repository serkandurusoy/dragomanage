import React, { Component } from 'react';
import {
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import {
  AutoForm,
  TextField,
  BoolField,
} from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Markalar } from '/imports/api/model';
import { MENSEILER } from '/imports/environment/enums';
import { guncellemeBeyaniSchema } from '/imports/environment/schema-globals';
import { marka as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const MarkaModal = (props) => <BaseModal
  kart={Kart}
  collection={Markalar}
  subscription="marka"
  formMethod={formMethod}
  title="Marka"
  {...props}
/>;

class Kart extends Component {
  render() {
    const {
      staticForm,
      setFormRef,
      schema,
      record,
      onSubmit,
      onChange,
      error,
      updateForm
    } = this.props;

    return <AutoForm
      className={staticForm && 'form-static'}
      staticForm={staticForm}
      ref={ref => setFormRef && setFormRef(ref)}
      schema={!updateForm ? schema : new SimpleSchema([schema, guncellemeBeyaniSchema])}
      model={record}
      onSubmit={onSubmit}
      onChange={onChange}
      error={error} >
      <SelectField
        autofocus
        content={record && record.tip && record.tip.enumValueToLabel(MENSEILER)}
        options={Object.keys(MENSEILER).map(v => MENSEILER[v])}
        multi={false}
        showInlineError
        name="tip" />
      <TextField
        showInlineError
        name="isim" />
      <BoolField
        transform={v => v === true ? 'Evet' : 'Hayır'}
        content={record && record.aktif ? 'Evet' : 'Hayır'}
        showInlineError
        name="aktif" />
      {
        updateForm && (
          record.createdAt.daysApartFromNow() > 30
            ? <Alert className="guncellemeUyarisi" bsStyle="danger">Dikkat! Değiştirmek istediğiniz bu kayıt bir aydan öncesine ait.</Alert>
            : record.createdAt.daysApartFromNow() > 7
              ? <Alert className="guncellemeUyarisi" bsStyle="warning">Değiştirmek istedğiniz bu kayıt bir haftadan öncesine ait.</Alert>
              : null
        )
      }
      {
        updateForm &&
        <BoolField
          className="guncellemeBeyani"
          transform={v => 'Bu işlemi gerçekleştirerek geçmişe dönük bilgi değiştirdiğimi; bu işlemin, geçmişte alınmış raporlar ile bundan sonra alınacaklar arasında uyumsuzluklara veya gündelik sistem kullanımında yanılgılara sebep olabileceğini biliyorum.'}
          showInlineError
          name="guncellemeBeyani" />
      }
    </AutoForm>
  }
}
