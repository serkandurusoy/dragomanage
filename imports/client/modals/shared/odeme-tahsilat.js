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
import { Etiketler, Kasalar, Kullanicilar } from '/imports/api/model';
import {
  ETIKETLER,
  KURLAR,
} from '/imports/environment/enums';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { cariKart } from '/imports/api/methods';

export default class Kart extends Component {
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
        <Col sm={6}>
          <SelectField
            staticField={updateForm}
            content={record && record.etiketLabels().join(', ')}
            name="etiketler"
            multi={true}
            showInlineError
            options={Etiketler.selectOptions(ETIKETLER.MUHASEBE.value, updateForm)}
          />
        </Col>
      </Row>
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
      <Row>
        <Col sm={2}>
          <BoolField
            staticField={updateForm}
            transform={v => v === true ? 'Evet' : 'Hayır'}
            content={record && record.belgeli ? 'Evet' : 'Hayır'}
            showInlineError
            name="belgeli" />
        </Col>
        <Col sm={5}>
          <DateTimeField
            staticField={updateForm}
            content={record && record.islemTarihi && record.islemTarihi.toFormattedDate()}
            isValidDate={v => v.isSameOrAfter(Date.sistemAcilis().isSameOrAfter(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter()) && v.isSameOrBefore(Date.today())}
            showInlineError
            timeFormat={false}
            name="islemTarihi" />
        </Col>
        <Col sm={5}>
          <DateTimeField
            staticField={updateForm}
            content={record && record.vadeTarihi && record.vadeTarihi.toFormattedDate()}
            isValidDate={v => v.isSameOrAfter(Date.sistemAcilis().isSameOrAfter(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter()) && v.isSameOrBefore(Date.inTwoYears())}
            showInlineError
            timeFormat={false}
            name="vadeTarihi" />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <SelectField
            staticField={updateForm}
            content={record && record.gerceklestiren && record.gerceklestirenLabel()}
            name="gerceklestiren"
            multi={false}
            showInlineError
            options={Kullanicilar.selectOptions(null, updateForm)}
          />
        </Col>
        <Col sm={6}>
          <SelectField
            staticField={updateForm}
            content={record && record.kasa && record.kasaLabel()}
            name="kasa"
            multi={false}
            showInlineError
            options={Kasalar.selectOptions(null, updateForm)}
          />
        </Col>
      </Row>
      <LongTextField
        staticField={updateForm}
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
