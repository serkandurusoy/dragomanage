import React, { Component } from 'react';
import {
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import {
  AutoForm,
  TextField,
  SelectField as CheckboxListField,
  BoolField,
} from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Kullanicilar } from '/imports/api/model';
import { YETKILER, ROLLER } from '/imports/environment/meta';
import { guncellemeBeyaniSchema } from '/imports/environment/schema-globals';
import { kullanici as formMethod} from '/imports/api/methods';
import BaseModal from './shared/base-modal';

export const KullaniciModal = (props) => <BaseModal
  kart={Kart}
  collection={Kullanicilar}
  subscription="kullanici"
  formMethod={formMethod}
  title="Kullanıcı"
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
      <Row>
        <Col sm={6}>
          <TextField
            showInlineError
            disabled={updateForm && !!record.user()}
            help={updateForm && record.user() && 'Kullanıcı giriş yaptığı için değiştirilemez'}
            name="ad" />
        </Col>
        <Col sm={6}>
          <TextField
            showInlineError
            disabled={updateForm && !!record.user()}
            help={updateForm && record.user() && 'Kullanıcı giriş yaptığı için değiştirilemez'}
            name="soyad" />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <TextField
            showInlineError
            disabled={updateForm && !!record.user()}
            help={updateForm && record.user() && 'Kullanıcı giriş yaptığı için değiştirilemez'}
            name="email" />
        </Col>
        <Col sm={6}>
          <SelectField
            content={record && record.rol && record.rol.enumValueToLabel(ROLLER)}
            options={Object.keys(ROLLER).map(v => ROLLER[v])}
            multi={false}
            showInlineError
            name="rol" />
        </Col>
      </Row>
      <CheckboxListField
        content={
          record && (
            record.adminVeyaPatron()
              ? 'Tüm alanlar'
              : !record.yetkiler
              ? 'Serbest alanlar'
              : ['Serbest alanlar'].concat(record.yetkiler.map(yetki => yetki.enumValueToLabel(YETKILER))).join(', ')
          )
        }
        className="checkbox-list-inline"
        transform={v => v.enumValueToLabel(YETKILER)}
        showInlineError
        name="yetkiler" />
      <Row>
        <Col sm={6}>
          <BoolField
            transform={v => v === true ? 'Evet' : 'Hayır'}
            content={record && record.gizli ? 'Evet' : 'Hayır'}
            showInlineError
            name="gizli" />
        </Col>
        <Col sm={6}>
          <BoolField
            transform={v => v === true ? 'Evet' : 'Hayır'}
            content={record && record.aktif ? 'Evet' : 'Hayır'}
            showInlineError
            name="aktif" />
        </Col>
      </Row>
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
