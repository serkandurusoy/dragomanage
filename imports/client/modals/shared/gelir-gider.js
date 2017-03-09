import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {
  Row,
  Col,
  Alert,
  Well,
} from 'react-bootstrap';
import {
  AutoForm,
  LongTextField,
  BoolField,
  TextField,
} from '/imports/client/components/uniforms-bootstrap3';
import { NumberField, SelectField, DateTimeField, DisplayIfField } from '/imports/client/components/uniforms-custom';
import { Etiketler, Urunler, Kullanicilar, Konumlar, Kurlar } from '/imports/api/model';
import {
  ETIKETLER,
  KURLAR,
} from '/imports/environment/enums';
import { iptalOnayiSchema } from '/imports/environment/schema-globals';
import { cariKart, urun } from '/imports/api/methods';

const selectedUrunId = new ReactiveVar(null);
const selectedKonum = new ReactiveVar(null);
const selectedAdet = new ReactiveVar(1);
const selectedTutar = new ReactiveVar(0);
const selectedTutarKurus = new ReactiveVar(0);
const selectedKur = new ReactiveVar(KURLAR.TRY.value);
const selectedIslemTarihi = new ReactiveVar(Date.today());

export default createContainer(props => {

  const SelectedUrunId = selectedUrunId.get();
  const SelectedAdet = selectedAdet.get();
  const SelectedTutar = selectedTutar.get();
  const SelectedTutarKurus = selectedTutarKurus.get();
  const SelectedKur = selectedKur.get();
  const SelectedIslemTarihi = selectedIslemTarihi.get();

  const subscriptionsReady = [
    Meteor.subscribe('gelirGiderUrunu', {_id: SelectedUrunId}),
  ].every(subscription => subscription.ready());

  const selectedUrun = SelectedUrunId && Urunler.findOne(SelectedUrunId)
    ? Urunler.findOne(SelectedUrunId)
    : {};

  let fiyataDikkat = 0;
  const selectedUrunTLFiyat = Kurlar.findOne({tarih: SelectedIslemTarihi})[(selectedUrun.kur || KURLAR.TRY.value)] * (selectedUrun.fiyat || 0) * 100 * (parseInt(SelectedAdet) || 1);
  const selectedUrunTLOzelFiyat = Kurlar.findOne({tarih: SelectedIslemTarihi})[(selectedUrun.kur || KURLAR.TRY.value)] * (selectedUrun.ozelFiyat || 0) * 100 * (parseInt(SelectedAdet) || 1);
  const selectedFiyat = Kurlar.findOne({tarih: SelectedIslemTarihi})[SelectedKur] * ( SelectedTutar * 100 + SelectedTutarKurus );

  if (selectedFiyat < selectedUrunTLFiyat) {
    fiyataDikkat = 1;
  }

  if (selectedFiyat < selectedUrunTLOzelFiyat) {
    fiyataDikkat = 2;
  }

  return {
    subscriptionsLoading: !subscriptionsReady,
    selectedUrun,
    selectedAdet: SelectedAdet,
    fiyataDikkat,
    selectedKonum: selectedKonum.get(),
  };

}, class Kart extends Component {
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
        onChangeModel={model => {
          model.urun !== selectedUrunId.get() && selectedUrunId.set(model.urun);
          model.konum !== selectedKonum.get() && selectedKonum.set(model.konum);
          model.adet !== selectedAdet.get() && selectedAdet.set(model.adet && parseInt(model.adet) || 1);
          model.tutar !== selectedTutar.get() && selectedTutar.set(model.tutar && parseInt(model.tutar) || 0);
          model.tutarKurus !== selectedTutarKurus.get() && selectedTutarKurus.set(model.tutarKurus && parseInt(model.tutarKurus) || 0);
          model.kur !== selectedKur.get() && selectedKur.set(model.kur || KURLAR.TRY.value);
          model.islemTarihi
            ? !model.islemTarihi.isSame(selectedIslemTarihi.get()) && selectedIslemTarihi.set(model.islemTarihi)
            : selectedIslemTarihi.set(Date.today());
        }}
        model={{adet: 1, ...record}}
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
              content={record && record.urun && record.urunLabel()}
              name="urun"
              multi={false}
              showInlineError
              method={{
                name: urun.select,
                args: {
                  sadeceSatilabilirUrunler: this.props.sadeceSatilabilirUrunler,
                  sadeceGelireUygunUrunler: this.props.sadeceGelireUygunUrunler,
                  sadeceGidereUygunUrunler: this.props.sadeceGidereUygunUrunler,
                }
              }}
              options={record && record.urun ? [{value: record.urun, label: record.urunLabel()}] : []}
            />
          </Col>
        </Row>
        {
          ( ((updateForm || staticForm) && record.konum) || this.props.selectedUrun.stokTakipli ) &&
          <Row>
            <Col sm={8}>
              <SelectField
                staticField={updateForm}
                content={record && record.gerceklestiren && record.konumLabel()}
                name="konum"
                multi={false}
                showInlineError
                options={Konumlar.selectOptions(null, updateForm)}
              />
            </Col>
            <Col sm={4}>
              <BoolField
                staticField={updateForm}
                transform={v => v === true ? 'Evet' : 'Hayır'}
                content={record && record.konsinye ? 'Evet' : 'Hayır'}
                showInlineError
                name="konsinye" />
            </Col>
          </Row>
        }
        {
          !updateForm && !staticForm && this.props.sadeceGelireUygunUrunler && this.props.selectedUrun.stokTakipli && this.props.selectedKonum &&
          <DisplayIfField condition={model => model.urun} >
            <Well className={`formIciBilgi text-center${this.props.selectedAdet >  this.props.selectedUrun.stokKonumBakiyesi(this.props.selectedKonum) ? ' purDikkat' : this.props.selectedAdet + this.props.selectedUrun.stokUyariLimiti >  this.props.selectedUrun.stokBakiyesi() ? ' dikkat' : ''}`} >
              Konum stoğu: { this.props.selectedUrun.stokKonumBakiyesi(this.props.selectedKonum) } adet - Toplam stok: { this.props.selectedUrun.stokBakiyesi() } adet
              {
                this.props.selectedAdet >  this.props.selectedUrun.stokKonumBakiyesi(this.props.selectedKonum)
                    ? ' - Konum stoğu yeterli değil'
                    : this.props.selectedUrun.stokUyariLimiti && this.props.selectedAdet + this.props.selectedUrun.stokUyariLimiti >  this.props.selectedUrun.stokBakiyesi()
                        ? ` - Kalan adet ${this.props.selectedUrun.stokUyariLimiti} limitini geçecek`
                        : ''
              }
            </Well>
          </DisplayIfField>
        }
        <Row>
          <Col sm={2}>
            <NumberField
              staticField={updateForm}
              showInlineError
              name="adet" />
          </Col>
          <Col sm={2}>
            <BoolField
              staticField={updateForm}
              transform={v => v === true ? 'Evet' : 'Hayır'}
              content={record && record.belgeli ? 'Evet' : 'Hayır'}
              showInlineError
              name="belgeli" />
          </Col>
          <Col sm={8}>
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
        {
          !updateForm && !staticForm && this.props.sadeceGelireUygunUrunler && (typeof this.props.selectedUrun.fiyat === 'number') &&
          <DisplayIfField condition={model => model.urun} >
            <Well className={`formIciBilgi text-center ${this.props.fiyataDikkat === 1 ? ' dikkat' : this.props.fiyataDikkat === 2 ? ' purDikkat' : ''}`}>
              Fiyat: {this.props.selectedUrun.fiyatLabel()} - Özel Fiyat: {this.props.selectedUrun.ozelFiyatLabel()} - Kdv: %{this.props.selectedUrun.kdvLabel()}
              {this.props.fiyataDikkat > 0 && ` - Girilen fiyat ürün ${this.props.fiyataDikkat === 2 ? 'özel ' : ''}fiyatının altında.`}
            </Well>
          </DisplayIfField>
        }
        <Row>
          <Col sm={6}>
            <DateTimeField
              staticField={updateForm}
              content={record && record.islemTarihi && record.islemTarihi.toFormattedDate()}
              isValidDate={v => v.isSameOrAfter(Date.sistemAcilis().isSameOrAfter(Date.lastQuarter()) ? Date.sistemAcilis() : Date.lastQuarter()) && v.isSameOrBefore(Date.today())}
              showInlineError
              timeFormat={false}
              name="islemTarihi" />
          </Col>
          <Col sm={6}>
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
            <TextField
              staticField={updateForm}
              showInlineError
              name="dosyaNo" />
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
)
