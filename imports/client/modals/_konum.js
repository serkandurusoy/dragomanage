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
import { Konumlar } from '/imports/api/model';
import { KONUMLAR } from '/imports/environment/enums';
import { guncellemeBeyaniSchema } from '/imports/environment/schema-globals';
import { konum as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const KonumModal = (props) => <BaseModal
  kart={Kart}
  collection={Konumlar}
  subscription="konum"
  formMethod={formMethod}
  title="Konum"
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
        disabled={updateForm}
        help={updateForm && 'Koum tipi değiştirilemez'}
        content={record && record.tip && record.tip.enumValueToLabel(KONUMLAR)}
        options={Object.keys(KONUMLAR).map(v => KONUMLAR[v])}
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
