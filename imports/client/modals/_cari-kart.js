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
  SelectField as CheckboxListField,
  BoolField,
} from '/imports/client/components/uniforms-bootstrap3';
import SimpleSchema from 'simpl-schema';
import { NumberField, SelectField, DateTimeField, DisplayIfField } from '/imports/client/components/uniforms-custom';
import { CariKartlar, Etiketler } from '/imports/api/model';
import {
  ETIKETLER,
  SEHIRLER,
  ULKELER,
  CARI_KARTLAR,
  DILLER,
  CINSIYETLER,
  BEDENLER,
  SEKAYAK_SEVIYELERI,
  DALIS_SERTIFIKALARI,
  DALIS_SEVIYELERI,
} from '/imports/environment/enums';
import { guncellemeBeyaniSchema } from '/imports/environment/schema-globals';
import { cariKart as formMethod } from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const CariKartModal = (props) => <BaseModal
  kart={Kart}
  collection={CariKartlar}
  subscription="cariKart"
  formMethod={formMethod}
  title="Cari kart"
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
        if (model.tip !== CARI_KARTLAR.SAHIS.value) {
          delete model.sahisBilgileri;
        }
        return model;
      }}
      ref={ref => setFormRef && setFormRef(ref)}
      schema={!updateForm ? schema : new SimpleSchema(schema).extend(guncellemeBeyaniSchema)}
      model={record}
      onSubmit={onSubmit}
      onChange={onChange}
      error={error} >
      <Row>
        <Col sm={3}>
          <SelectField
            autofocus
            content={record && record.tip && record.tip.enumValueToLabel(CARI_KARTLAR)}
            options={Object.keys(CARI_KARTLAR).map(v => CARI_KARTLAR[v])}
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
            options={Etiketler.selectOptions(ETIKETLER.CARI_KART.value, updateForm)}
          />
        </Col>
      </Row>
      <TextField
        showInlineError
        name="unvan" />
      <Row>
        <Col sm={6}>
          <TextField
            showInlineError
            name="kisaIsim" />
        </Col>
        <Col sm={6}>
          <NumberField
            showInlineError
            type="tel"
            name="telefon" />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <TextField
            showInlineError
            type="email"
            name="email" />
        </Col>
        <Col sm={6}>
          <TextField
            showInlineError
            type="url"
            name="webSitesi" />
        </Col>
      </Row>
      <TextField
        showInlineError
        name="adres" />
      <Row>
        <Col sm={6}>
          <SelectField
            content={record && record.sehir && record.sehir.enumValueToLabel(SEHIRLER)}
            name="sehir"
            multi={false}
            options={Object.keys(SEHIRLER).map(v => SEHIRLER[v])}
          />
        </Col>
        <Col sm={6}>
          <SelectField
            content={record && record.ulke && record.ulke.enumValueToLabel(ULKELER)}
            name="ulke"
            multi={false}
            options={Object.keys(ULKELER).map(v => ULKELER[v])}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <TextField
            showInlineError
            name="vergiDairesi" />
        </Col>
        <Col sm={6}>
          <NumberField
            showInlineError
            name="vergiNumarasi" />
        </Col>
      </Row>
      <TextField
        showInlineError
        name="iban" />
      <LongTextField
        showInlineError
        name="notlar" />
      <DisplayIfField condition={model => model.tip === CARI_KARTLAR.SAHIS.value}>
        <div>
          <Row>
            <Col sm={6}>
              <SelectField
                content={record && record.sahisBilgileri && record.sahisBilgileri.uyruk && record.sahisBilgileri.uyruk.enumValueToLabel(ULKELER)}
                name="sahisBilgileri.uyruk"
                multi={false}
                options={Object.keys(ULKELER).map(v => ULKELER[v])}
              />
            </Col>
            <Col sm={6}>
              <TextField
                showInlineError
                name="sahisBilgileri.pasaportVeyaTCNo" />
            </Col>
          </Row>
          <CheckboxListField
            content={record && record.sahisBilgileri && record.sahisBilgileri.diller && record.sahisBilgileri.diller.map(dil => dil.enumValueToLabel(DILLER)).join(', ') }
            className="checkbox-list-inline"
            transform={v => v.enumValueToLabel(DILLER)}
            showInlineError
            name="sahisBilgileri.diller" />
          <Row>
            <Col sm={6}>
              <SelectField
                content={record && record.sahisBilgileri && record.sahisBilgileri.cinsiyet && record.sahisBilgileri.cinsiyet.enumValueToLabel(CINSIYETLER)}
                multi={false}
                options={Object.keys(CINSIYETLER).map(v => CINSIYETLER[v])}
                name="sahisBilgileri.cinsiyet" />
            </Col>
            <Col sm={6}>
              <DateTimeField
                isValidDate={v => v.isSameOrBefore(Date.yesterday())}
                content={record && record.sahisBilgileri && record.sahisBilgileri.dogumTarihi && record.sahisBilgileri.dogumTarihi.toFormattedDate()}
                showInlineError
                timeFormat={false}
                name="sahisBilgileri.dogumTarihi" />
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <SelectField
                content={record && record.sahisBilgileri && record.sahisBilgileri.beden && record.sahisBilgileri.beden.enumValueToLabel(BEDENLER)}
                multi={false}
                options={Object.keys(BEDENLER).map(v => BEDENLER[v])}
                name="sahisBilgileri.beden" />
            </Col>
            <Col sm={6}>
              <NumberField
                showInlineError
                name="sahisBilgileri.ayak" />
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <DateTimeField
                content={record && record.sahisBilgileri && record.sahisBilgileri.sonDalisTarihi && record.sahisBilgileri.sonDalisTarihi.toFormattedDate()}
                showInlineError
                timeFormat={false}
                name="sahisBilgileri.sonDalisTarihi" />
            </Col>
            <Col sm={6}>
              <NumberField
                showInlineError
                name="sahisBilgileri.toplamDalisSayisi" />
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <SelectField
                content={record && record.sahisBilgileri && record.sahisBilgileri.dalisSertifikasi && record.sahisBilgileri.dalisSertifikasi.enumValueToLabel(DALIS_SERTIFIKALARI)}
                multi={false}
                options={Object.keys(DALIS_SERTIFIKALARI).map(v => DALIS_SERTIFIKALARI[v])}
                name="sahisBilgileri.dalisSertifikasi" />
            </Col>
            <Col sm={6}>
              <SelectField
                content={record && record.sahisBilgileri && record.sahisBilgileri.dalisSeviyesi && record.sahisBilgileri.dalisSeviyesi.enumValueToLabel(DALIS_SEVIYELERI)}
                multi={false}
                options={Object.keys(DALIS_SEVIYELERI).map(v => DALIS_SEVIYELERI[v])}
                name="sahisBilgileri.dalisSeviyesi" />
            </Col>
          </Row>
          <SelectField
            content={record && record.sahisBilgileri && record.sahisBilgileri.seakayakSeviyesi && record.sahisBilgileri.seakayakSeviyesi.enumValueToLabel(SEKAYAK_SEVIYELERI)}
            multi={false}
            options={Object.keys(SEKAYAK_SEVIYELERI).map(v => SEKAYAK_SEVIYELERI[v])}
            name="sahisBilgileri.seakayakSeviyesi" />
          <LongTextField
            showInlineError
            name="sahisBilgileri.aktiviteNotlari" />
        </div>
      </DisplayIfField>
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
