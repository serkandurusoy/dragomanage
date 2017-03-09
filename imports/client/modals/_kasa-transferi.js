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
} from '/imports/client/components/uniforms-bootstrap3';
import { NumberField, SelectField, DateTimeField } from '/imports/client/components/uniforms-custom';
import { KasaTransferleri, Kasalar } from '/imports/api/model';
import {
  KURLAR,
} from '/imports/environment/enums';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { kasaTransferi as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const KasaTransferiModal = (props) => <BaseModal
  kart={Kart}
  collection={KasaTransferleri}
  schema={props.operation === 'update' && new SimpleSchema([KasaTransferleri.Schema, iptalOnayiSchema])}
  subscription="kasaTransferi"
  formMethod={formMethod}
  title="Kasa transferi"
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
      className={staticForm && 'form-static'}
      staticForm={staticForm}
      ref={ref => setFormRef && setFormRef(ref)}
      schema={!updateForm ? schema : new SimpleSchema([schema, iptalOnayiSchema])}
      onValidate={(model, error, callback) => {
        if (updateForm) {
          if (record.islemTarihi.daysApartFromNow() < 90) {
            callback(error);
          }
        } else {
          callback(error);
        }
      }}
      model={record}
      onSubmit={onSubmit}
      onChange={onChange}
      error={error} >
      <Row>
        <Col sm={4}>
          <NumberField
            staticField={updateForm}
            disabled={updateForm}
            showInlineError
            name="tutar" />
        </Col>
        <Col sm={4}>
          <NumberField
            staticField={updateForm}
            disabled={updateForm}
            showInlineError
            name="tutarKurus" />
        </Col>
        <Col sm={4}>
          <SelectField
            staticField={updateForm}
            disabled={updateForm}
            content={record && record.kur && record.kur.enumValueToLabel(KURLAR)}
            options={Object.keys(KURLAR).map(v => KURLAR[v])}
            multi={false}
            showInlineError
            name="kur" />
        </Col>
      </Row>
      <Row>
        <Col sm={4}>
          <DateTimeField
            staticField={updateForm}
            disabled={updateForm}
            content={record && record.islemTarihi && record.islemTarihi.toFormattedDate()}
            isValidDate={v => v.isSameOrAfter(Date.sistemAcilis().isSameOrAfter(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter()) && v.isSameOrBefore(Date.today())}
            showInlineError
            timeFormat={false}
            name="islemTarihi" />
        </Col>
        <Col sm={4}>
          <SelectField
            staticField={updateForm}
            disabled={updateForm}
            content={record && record.kasaKaynak && record.kasaKaynakLabel()}
            name="kasaKaynak"
            multi={false}
            showInlineError
            options={Kasalar.selectOptions(null, updateForm)}
          />
        </Col>
        <Col sm={4}>
          <SelectField
            staticField={updateForm}
            disabled={updateForm}
            content={record && record.kasaHedef && record.kasaHedefLabel()}
            name="kasaHedef"
            multi={false}
            showInlineError
            options={Kasalar.selectOptions(null, updateForm)}
          />
        </Col>
      </Row>
      <LongTextField
        staticField={updateForm}
        disabled={updateForm}
        showInlineError
        name="aciklama" />
      {
        updateForm && (
          record.tutarX100 === 0
            ? <Alert className="guncellemeUyarisi" bsStyle="danger">İptal edilmiş kayıtlar tekrar değiştirilemez.</Alert>
            :record.islemTarihi.daysApartFromNow() >= 90
              ? <Alert className="guncellemeUyarisi" bsStyle="danger">Üç aydan öncesine ait operasyonel kayıtlar iptal edilemez.</Alert>
              : record.islemTarihi.daysApartFromNow() > 30
                ? <Alert className="guncellemeUyarisi" bsStyle="danger">Dikkat! İptal etmek istediğiniz bu kayıt bir aydan öncesine ait.</Alert>
                : record.islemTarihi.daysApartFromNow() > 7
                  ? <Alert className="guncellemeUyarisi" bsStyle="warning">İptal etmek istedğiniz bu kayıt bir haftadan öncesine ait.</Alert>
                  : null
        )
      }
      {
        updateForm && record.islemTarihi.daysApartFromNow() < 90 && record.tutarX100 > 0 &&
        <LongTextField
          className="iptalAciklamasi"
          showInlineError
          name="iptalAciklamasi" />
      }
      {
        updateForm && record.islemTarihi.daysApartFromNow() < 90 && record.tutarX100 > 0 &&
        <BoolField
          className="guncellemeBeyani"
          transform={v => 'Bu işlemi gerçekleştirerek geçmişe dönük bilgi değiştirdiğimi; bu işlemin, geçmişte alınmış raporlar ile bundan sonra alınacaklar arasında uyumsuzluklara veya gündelik sistem kullanımında yanılgılara sebep olabileceğini biliyorum.'}
          showInlineError
          name="iptalOnayi" />
      }
    </AutoForm>
  }
}
