import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import {
  Row,
  Col,
} from 'react-bootstrap';
import { AutoForm } from '/imports/client/components/uniforms-bootstrap3';
import { NumberField } from '/imports/client/components/uniforms-custom';
import { Kurlar } from '/imports/api/model';
import { KURLAR } from '/imports/environment/enums';
import debounce from '/imports/utils/debounce';

export default withTracker(() => {

  return {
    kurlar: Kurlar.findOne({}, { sort: {tarih: -1}, limit: 1 })
  };

})(class KurHesaplayici extends Component {

  constructor() {
    super();
    this.kurHesapla = debounce(this.kurHesapla, 300);
  }

  state = {
    [KURLAR.TRY.value]: 0,
    [KURLAR.USD.value]: 0,
    [KURLAR.GBP.value]: 0,
    [KURLAR.EUR.value]: 0,
  }

  kurHesapla = (model) => {

    const total = (
      ( ( !!model[KURLAR.USD.value] ? parseInt(model[KURLAR.USD.value]) : 0) * this.props.kurlar[KURLAR.USD.value] * 10000) +
      ( ( !!model[KURLAR.EUR.value] ? parseInt(model[KURLAR.EUR.value]) : 0) * this.props.kurlar[KURLAR.EUR.value] * 10000) +
      ( ( !!model[KURLAR.GBP.value] ? parseInt(model[KURLAR.GBP.value]) : 0) * this.props.kurlar[KURLAR.GBP.value] * 10000) +
      ( ( !!model[KURLAR.TRY.value] ? parseInt(model[KURLAR.TRY.value]) : 0) * this.props.kurlar[KURLAR.TRY.value] * 10000)
    );

    this.setState({
      [KURLAR.TRY.value]: ( Math.round( ( total / (this.props.kurlar[KURLAR.TRY.value] * 10000) * 20) ) / 20 ),
      [KURLAR.USD.value]: ( Math.round( ( total / (this.props.kurlar[KURLAR.USD.value] * 10000) * 20) ) / 20 ),
      [KURLAR.GBP.value]: ( Math.round( ( total / (this.props.kurlar[KURLAR.GBP.value] * 10000) * 20) ) / 20 ),
      [KURLAR.EUR.value]: ( Math.round( ( total / (this.props.kurlar[KURLAR.EUR.value] * 10000) * 20) ) / 20 ),
    });

  }

  render() {

    return <Row>
      <Col xs={12} className="kurHesaplayici">
        <AutoForm
          validate="onChange"
          schema={new SimpleSchema({
            [KURLAR.USD.value]: {type: Number, min:0, max: 1000000, optional: true},
            [KURLAR.EUR.value]: {type: Number, min:0, max: 1000000, optional: true},
            [KURLAR.GBP.value]: {type: Number, min:0, max: 1000000, optional: true},
            [KURLAR.TRY.value]: {type: Number, min:0, max: 1000000, optional: true},
          })}
          onChangeModel={model => Object.keys(model).map(k => model[k]).every(k => k <= 1000000) && this.kurHesapla(model)}
        >
          <Row>
            <Col xs={6} sm={3}>
              <NumberField
                autofocus
                label={false}
                placeholder={KURLAR.USD.label}
                showInlineError
                name={KURLAR.USD.value} />
              <h5>{this.state[KURLAR.USD.value].toCurrencyDisplay(2, KURLAR.USD.value)}</h5>
            </Col>
            <Col xs={6} sm={3}>
              <NumberField
                label={false}
                placeholder={KURLAR.EUR.label}
                showInlineError
                name={KURLAR.EUR.value} />
              <h5>{this.state[KURLAR.EUR.value].toCurrencyDisplay(2, KURLAR.EUR.value)}</h5>
            </Col>
            <Col xs={6} sm={3}>
              <NumberField
                label={false}
                placeholder={KURLAR.GBP.label}
                showInlineError
                name={KURLAR.GBP.value} />
              <h5>{this.state[KURLAR.GBP.value].toCurrencyDisplay(2, KURLAR.GBP.value)}</h5>
            </Col>
            <Col xs={6} sm={3}>
              <NumberField
                label={false}
                placeholder={KURLAR.TRY.label}
                showInlineError
                name={KURLAR.TRY.value} />
              <h5>{this.state[KURLAR.TRY.value].toCurrencyDisplay(2, KURLAR.TRY.value)}</h5>
            </Col>
          </Row>
        </AutoForm>
        <small><em>{this.props.kurlar.tarihYayin.toFormattedDate()} 15:30'da açıklanan TCMB gösterge döviz satış kurlarına göre hesaplanmaktadır.</em></small>
      </Col>
    </Row>

  }

})
