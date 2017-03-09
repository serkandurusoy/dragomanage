import React, { Component } from 'react';
import {
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import {
  AutoForm,
  LongTextField,
  BoolField,
  TextField,
} from '/imports/client/components/uniforms-bootstrap3';
import { NumberField, SelectField, DisplayIfField } from '/imports/client/components/uniforms-custom';
import { Talepler } from '/imports/api/model';
import {
  TALEPLER,
  KURLAR,
} from '/imports/environment/enums';
import { talep as formMethod, urun, cariKart } from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const TalepModal = (props) => <BaseModal
  kart={Kart}
  collection={Talepler}
  schema={Talepler.Schema}
  subscription="talep"
  formMethod={formMethod}
  title="Talep"
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
      updateForm,
    } = this.props;

    return <AutoForm
      onValidate={(model, error, callback) => {
        if (updateForm) {
          if (!record.islendi) {
            callback(error);
          }
        } else {
          callback(error);
        }
      }}
      className={staticForm && 'form-static'}
      staticForm={staticForm}
      ref={ref => setFormRef && setFormRef(ref)}
      schema={schema}
      model={record}
      onSubmit={onSubmit}
      onChange={onChange}
      error={error} >
      {
        ( staticForm || updateForm ) &&
        <TextField
          staticField={updateForm}
          content={record && record.kaydeden && record.kullanici()}
          showInlineError
          name="kaydeden" />
      }
      <Row>
        <Col sm={6}>
          <SelectField
            staticField={updateForm}
            content={record && record.islem && record.islem.enumValueToLabel(TALEPLER)}
            options={Object.keys(TALEPLER).map(v => TALEPLER[v])}
            multi={false}
            showInlineError
            name="islem" />
        </Col>
        <Col sm={6}>
          <SelectField
            staticField={updateForm}
            content={record && record.cariKart && record.cariKartLabel()}
            name="cariKart"
            multi={false}
            showInlineError
            method={{name: cariKart.select}}
            options={record && record.cariKart ? [{value: record.cariKart, label: record.cariKartLabel()}] : []}
          />
        </Col>
      </Row>
      <DisplayIfField condition={model => [TALEPLER.GELIR.value, TALEPLER.GIDER.value].includes(model.islem)}>
        <Row>
          <Col sm={6}>
            <SelectField
              staticField={updateForm}
              content={record && record.urun && record.urunLabel()}
              name="urun"
              multi={false}
              showInlineError
              method={{name: urun.select}}
              options={record && record.urun ? [{value: record.urun, label: record.urunLabel()}] : []}
            />
          </Col>
          <Col sm={6}>
            <NumberField
              staticField={updateForm}
              disabled={updateForm}
              showInlineError
              name="adet" />
          </Col>
        </Row>
      </DisplayIfField>
      <Row>
        <Col sm={4}>
          <NumberField
            staticField={updateForm}
            showInlineError
            name="tutar" />
        </Col>
        <Col sm={4}>
          <NumberField
            staticField={updateForm}
            showInlineError
            name="tutarKurus" />
        </Col>
        <Col sm={4}>
          <SelectField
            staticField={updateForm}
            content={record && record.kur && record.kur.enumValueToLabel(KURLAR)}
            options={Object.keys(KURLAR).map(v => KURLAR[v])}
            multi={false}
            showInlineError
            name="kur" />
        </Col>
      </Row>
      <LongTextField
        staticField={updateForm}
        disabled={updateForm}
        showInlineError
        name="aciklama" />
      {
        ( (!updateForm && record && record.islendi) || (updateForm && !record.islendi) ) &&
        <LongTextField
          staticField={updateForm && record.islendi}
          showInlineError
          name="aciklamaIslendi" />
      }
      {
        ( (!updateForm && record && record.islendi) || (updateForm && !record.islendi) ) &&
        <Row>
          <Col sm={6}>
            <TextField
              staticField={updateForm && record.islendi}
              showInlineError
              name="reference" />
          </Col>
          <Col sm={6}>
            <BoolField
              staticField={updateForm && record.islendi}
              transform={v => v === true ? 'Evet' : 'Hayır'}
              content={record && record.islendi ? 'Evet' : 'Hayır'}
              showInlineError
              name="islendi" />
          </Col>
        </Row>
      }
      {
        updateForm && record.islendi &&
        <Alert className="guncellemeUyarisi" bsStyle="danger">İşlenmiş kayıtlar tekrar değiştirilemez.</Alert>
      }
    </AutoForm>
  }
}
