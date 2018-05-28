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
import { StokTransferleri, Konumlar, Urunler } from '/imports/api/model';
import {
  KURLAR,
} from '/imports/environment/enums';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { stokTransferi as formMethod, urun } from '/imports/api/methods';
import BaseModal from './shared/base-modal';
import SimpleSchema from 'simpl-schema';

export const StokTransferiModal = (props) => <BaseModal
  kart={Kart}
  collection={StokTransferleri}
  schema={props.operation === 'update' && new SimpleSchema(StokTransferleri.Schema).extend(iptalOnayiSchema)}
  subscription="stokTransferi"
  formMethod={formMethod}
  title="Stok transferi"
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
      schema={!updateForm ? schema : new SimpleSchema(schema).extend( iptalOnayiSchema)}
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
            autofocus
            staticField={updateForm}
            disabled={updateForm}
            showInlineError
            name="adet" />
        </Col>
        <Col sm={8}>
          <SelectField
            staticField={updateForm}
            content={record && record.urun && record.urunLabel()}
            name="urun"
            multi={false}
            showInlineError
            method={{
              name: urun.select,
              args: {
                sadeceStokTakipliUrunler: true,
              }
            }}
            options={record && record.urun ? [{value: record.urun, label: record.urunLabel()}] : []}
          />
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
            content={record && record.konumKaynak && record.konumKaynakLabel()}
            name="konumKaynak"
            multi={false}
            showInlineError
            options={Konumlar.selectOptions(null, updateForm)}
          />
        </Col>
        <Col sm={4}>
          <SelectField
            staticField={updateForm}
            disabled={updateForm}
            content={record && record.konumHedef && record.konumHedefLabel()}
            name="konumHedef"
            multi={false}
            showInlineError
            options={Konumlar.selectOptions(null, updateForm)}
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
          record.adet === 0
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
        updateForm && record.islemTarihi.daysApartFromNow() < 90 && record.adet > 0 &&
        <LongTextField
          className="iptalAciklamasi"
          showInlineError
          name="iptalAciklamasi" />
      }
      {
        updateForm && record.islemTarihi.daysApartFromNow() < 90 && record.adet > 0 &&
        <BoolField
          className="guncellemeBeyani"
          transform={v => 'Bu işlemi gerçekleştirerek geçmişe dönük bilgi değiştirdiğimi; bu işlemin, geçmişte alınmış raporlar ile bundan sonra alınacaklar arasında uyumsuzluklara veya gündelik sistem kullanımında yanılgılara sebep olabileceğini biliyorum.'}
          showInlineError
          name="iptalOnayi" />
      }
    </AutoForm>
  }
}
