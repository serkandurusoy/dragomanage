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
import { SelectField, DisplayIfField } from '/imports/client/components/uniforms-custom';
import { Siniflar } from '/imports/api/model';
import { SINIFLAR } from '/imports/environment/enums';
import { guncellemeBeyaniSchema } from '/imports/environment/schema-globals';
import { sinif as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const SinifModal = (props) => <BaseModal
  kart={Kart}
  collection={Siniflar}
  subscription="sinif"
  formMethod={formMethod}
  title="Sınıf"
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
        disabled={updateForm}
        help={updateForm && 'Sınıf tipi değiştirilemez'}
        content={record && record.tip && record.tip.enumValueToLabel(SINIFLAR)}
        options={Object.keys(SINIFLAR).map(v => SINIFLAR[v])}
        multi={false}
        showInlineError
        name="tip" />
      <DisplayIfField condition={model => model.tip === SINIFLAR.GRUP.value}>
        <SelectField
          autofocus
         content={record && record.ustLabel}
          options={Siniflar.selectOptions(SINIFLAR.IS.value, updateForm)}
          multi={false}
          showInlineError
          name="ust" />
      </DisplayIfField>
      <DisplayIfField condition={model => model.tip === SINIFLAR.SINIF.value}>
        <SelectField
          autofocus
          content={record && record.ustLabel}
          options={Siniflar.selectOptions(SINIFLAR.GRUP.value, updateForm)}
          multi={false}
          showInlineError
          name="ust" />
      </DisplayIfField>
      <TextField
        showInlineError
        name="isim" />
      <DisplayIfField condition={model => model.tip === SINIFLAR.SINIF.value}>
        <Row>
          <Col sm={6}>
            <BoolField
              transform={v => v === true ? 'Evet' : 'Hayır'}
              content={record && record.gelir ? 'Evet' : 'Hayır'}
              showInlineError
              name="gelir" />
          </Col>
          <Col sm={6}>
            <BoolField
              transform={v => v === true ? 'Evet' : 'Hayır'}
              content={record && record.gider ? 'Evet' : 'Hayır'}
              showInlineError
              name="gider" />
          </Col>
        </Row>
      </DisplayIfField>
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
