import React, { Component } from 'react';
import {
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import {
  AutoForm,
  TextField,
  LongTextField,
  BoolField,
} from '/imports/client/components/uniforms-bootstrap3';
import { NumberField, SelectField, DisplayIfField } from '/imports/client/components/uniforms-custom';
import { Urunler, Etiketler, Siniflar, Markalar } from '/imports/api/model';
import {
  ETIKETLER,
  URUNLER,
  KDVLER,
  SINIFLAR,
  MENSEILER,
  KURLAR,
} from '/imports/environment/enums';
import { guncellemeBeyaniSchema } from '/imports/environment/schema-globals';
import { urun as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const UrunModal = (props) => <BaseModal
  kart={Kart}
  collection={Urunler}
  subscription="urun"
  formMethod={formMethod}
  title="Ürün"
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
      modelTransform={(mode, model) => {
        if (model.satilabilir === false) {
          delete model.barkod;
          delete model.stokTakipli;
          delete model.stokUyariLimiti;
          delete model.fiyat;
          delete model.ozelFiyat;
          delete model.kur;
        }
        return model;
      }}
      ref={ref => setFormRef && setFormRef(ref)}
      schema={!updateForm ? schema : new SimpleSchema([schema, guncellemeBeyaniSchema])}
      model={record}
      onSubmit={onSubmit}
      onChange={onChange}
      error={error} >
      <Row>
        <Col sm={3}>
          <SelectField
            content={record && record.tip && record.tip.enumValueToLabel(URUNLER)}
            options={Object.keys(URUNLER).map(v => URUNLER[v])}
            multi={false}
            showInlineError
            name="tip" />
        </Col>
        <Col sm={9}>
          <SelectField
            content={record && record.etiketLabels().join(', ')}
            name="etiketler"
            multi={true}
            showInlineError
            options={Etiketler.selectOptions(ETIKETLER.URUN.value, updateForm)}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={8}>
          <SelectField
            content={record && record.sinif && Siniflar.findOne(record.sinif).label()}
            name="sinif"
            multi={false}
            showInlineError
            options={Siniflar.selectOptions(SINIFLAR.SINIF.value, updateForm)}
          />
        </Col>
        <Col sm={4}>
          <SelectField
            content={record && record.mensei && record.mensei.enumValueToLabel(MENSEILER)}
            options={Object.keys(MENSEILER).map(v => MENSEILER[v])}
            multi={false}
            showInlineError
            name="mensei" />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <SelectField
            content={record && record.markaLabel}
            name="marka"
            multi={false}
            showInlineError
            options={Markalar.selectOptions(null, updateForm)}
          />
        </Col>
        <Col sm={6}>
          <TextField
            showInlineError
            name="isim" />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <SelectField
            content={record && record.kdvLabel()}
            options={Object.keys(KDVLER).map(v => KDVLER[v])}
            multi={false}
            showInlineError
            name="kdv" />
        </Col>
        <Col sm={6}>
          <BoolField
            transform={v => v === true ? 'Evet' : 'Hayır'}
            content={record && record.satilabilir ? 'Evet' : 'Hayır'}
            showInlineError
            name="satilabilir" />
        </Col>
      </Row>
      <DisplayIfField condition={model => model.satilabilir === true}>
        <div>
          <Row>
            <Col sm={4}>
              <NumberField
                showInlineError
                name="barkod" />
            </Col>
            <Col sm={4}>
              <BoolField
                transform={v => v === true ? 'Evet' : 'Hayır'}
                content={record && record.stokTakipli ? 'Evet' : 'Hayır'}
                showInlineError
                name="stokTakipli" />
            </Col>
            <Col sm={4}>
              <NumberField
                showInlineError
                name="stokUyariLimiti" />
            </Col>
          </Row>
          <Row>
            <Col sm={4}>
              <NumberField
                showInlineError
                name="fiyat" />
            </Col>
            <Col sm={4}>
              <NumberField
                showInlineError
                name="ozelFiyat" />
            </Col>
            <Col sm={4}>
              <SelectField
                content={record && record.kur && record.kur.enumValueToLabel(KURLAR)}
                options={Object.keys(KURLAR).map(v => KURLAR[v])}
                multi={false}
                showInlineError
                name="kur" />
            </Col>
          </Row>
        </div>
      </DisplayIfField>
      <LongTextField
        showInlineError
        name="notlar" />
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
