import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Row, Col, Table, Button, Well } from 'react-bootstrap';
import { AutoForm, SubmitField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField, NumberField } from '/imports/client/components/uniforms-custom';
import { Container, PageHeader, TableRowEmpty, TableRowLoading } from '/imports/client/components';
import { urun } from '/imports/api/methods';
import FontAwesome from 'react-fontawesome';
import { Urunler } from '/imports/api/model';
import JSBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import moment from 'moment-timezone';
import SimpleSchema from 'simpl-schema';

// https://github.com/lindell/JsBarcode/wiki/Options
// we also installed barcode-scan-listener but we're not using it yet
function Barcode(props) {
  const canvas = document.createElement('canvas');
  JSBarcode(canvas, props.barcode, {width: 2, height: 40});
  const blob = canvas.toDataURL();
  return <img className="barcodeImage" alt={props.barcode} src={blob}/>;
}

const BarkodUrunItem = withTracker(props => {

  const subscriptionsReady = [
    Meteor.subscribe('gelirGiderUrunu', {_id: props.urunId}),
  ].every(subscription => subscription.ready());

  return {
    subscriptionsLoading: !subscriptionsReady,
    urun: Urunler.findOne(props.urunId),
  }

})(({urun, urunId, adet, cikar, subscriptionsLoading}) => subscriptionsLoading
  ? <TableRowLoading colSpan={7}/>
  : <tr>
      <td data-th="Marka">{urun.marka}</td>
      <td data-th="İsim">{urun.isim}</td>
      <td data-th="Barkod no">{urun.barkod}</td>
      <td data-th="Barkod"><Barcode barcode={urun.barkod} /></td>
      <td data-th="Fiyat" className="text-right noWrap">{urun.fiyatLabel()}</td>
      <td data-th="Adet" className="text-center">{adet}</td>
      <td className="text-right">
        <Button bsStyle="warning" bsSize="xsmall" onClick={e => cikar(e,urunId)} >
          <FontAwesome name='trash-o' />
        </Button>
      </td>
    </tr>
);


export default class Barkod extends Component {

  state = {
    list: []
  }

  form = null;

  cikar = (e, urun) => {
    e.preventDefault();
    const newList = this.state.list.filter(item => item.urun !== urun);
    this.setState({
      list: newList,
    })
  }

  ekle = (doc) => {
    const newList = [...this.state.list, doc].reduce((reduced, item) => {
      let newList = [...reduced];
      const ix = newList.findIndex(li => li.urun === item.urun)
      if (ix > -1) {
        newList[ix].adet += item.adet
      } else {
        newList.push(item)
      }
      return newList;
    }, [])
    this.setState({
      list: newList
    })
    if (this.form) this.form.reset();
  }

  render() {

    const {list} = this.state;

    return <Container yetki={this.props.yetki}>
      <PageHeader title="Barkod" hideAddButton={true} />
      <Row className="searchRow">
        <AutoForm
          ref={ref => this.form = ref}
          schema={new SimpleSchema({
            urun: {label: 'Ürün', type: String},
            adet: {label: 'Adet', type: Number, min: 1, defaultValue: 1, max: 100},
          })}
          onSubmit={doc => this.ekle(doc)}
        >
          <Col xs={12}>
            <Row>
              <Col sm={8} className="searchContainer">
                <SelectField
                  autofocus
                  label={false}
                  name="urun"
                  placeholder="Ürün"
                  multi={false}
                  method={{
                    name: urun.select,
                    args: {sadeceBarkodluUrunler: true}
                  }}
                />
              </Col>
              <Col xs={8} sm={2} className="searchContainer">
                <NumberField
                  showInlineError
                  name="adet"
                  label={false}
                  placeholder="Adet"
                />
              </Col>
              <Col xs={4} sm={2} className="searchContainer text-center">
                <SubmitField value="Ekle" inputClassName="btn btn-success"/>
              </Col>
            </Row>
          </Col>
        </AutoForm>
      </Row>
      <Row>
        <Col xs={12}>
          <Table className="customResponsive" striped hover>
            <thead>
            <tr>
              <th>Marka</th>
              <th>İsim</th>
              <th>Barkod no</th>
              <th>Barkod</th>
              <th className="text-right">Fiyat</th>
              <th className="text-center">Adet</th>
              <th className="text-right"></th>
            </tr>
            </thead>
            <tbody>
            {
              list.length
                ? list.map(item => <BarkodUrunItem key={item.urun} urunId={item.urun} adet={item.adet} cikar={this.cikar} /> )
                : <TableRowEmpty colSpan={7}/>
            }
            </tbody>
          </Table>
        </Col>
      </Row>
      {
        list.length > 0 && <BarcodePrinter list={list} />
      }
    </Container>;

  }

}

class BarcodePrinter extends Component {

  printPage = (page) => {

    urun.fetch.call({list: this.props.list.map(l => l.urun)}, (e,r) => {
      let urunObject = {};
      r.forEach(urun => urunObject[urun._id] = urun);

      const {
        sayfaX,
        sayfaY,
        etiketX,
        etiketY,
        boslukX,
        boslukY,
        kaydir,
      } = page;

      const perRow = Math.floor((sayfaX - 2 * boslukX) / etiketX);
      const perColumn = Math.floor((sayfaY - 2 * boslukY) / etiketY);
      const perPage = perRow * perColumn;

      let list = Array.from({length: kaydir}).map(_ => ({urun: false}));
      this.props.list.forEach(item => Array.from({length: item.adet}).forEach(_ => list.push({urun: item.urun, adet: item.adet})));

      const listGeometry = list.map((item, ix) => {
        const column = ix % perRow;
        const row = Math.floor(ix / perRow);
        const x = boslukX + column * etiketX;
        const y = boslukY + row * etiketY;
        const page = Math.floor(ix / perPage);
        let itemObject = {};
        if (item.urun) itemObject = urunObject[item.urun]
        return {
          _id: false,
          ...itemObject,
          x,
          y: y - page * sayfaY,
          page,
        }
      });


      const doc = new jsPDF();
      doc.setFontSize(6);
      listGeometry.forEach((item,ix) => {
        if (ix > 0 && listGeometry[ix-1].page !== item.page) doc.addPage();
        const x = item.x;
        const y = item.y + item.page * boslukY * 2;
        if (item._id) {
          doc.text(x + 2, y + 1.5, `${item.marka ? item.marka + ' ' : ''}${item.isim}`);
          const canvas = document.createElement('canvas');
          JSBarcode(canvas, item.barkod, {width: 2, height: 40});
          const blob = canvas.toDataURL();
          doc.addImage(blob,'JPEG', x,  y + 3, etiketX * 0.95, etiketY * 0.7)
          doc.text(x + 16, y + 4.2 + etiketY * 0.7, item.fiyat.split('₺').join('TL'));
        }
      })
      doc.save(`barkod.pdf-${moment().format('DD.MM.YYYY-HH.mm')}.pdf`);

    })

  }

  render() {

    return <Well className="barkodYazdir kurHesaplayici">
      <AutoForm
        schema={new SimpleSchema({
          sayfaX: {label:'Sayfa X', type: Number, min: 1, defaultValue: 210, max: 420},
          sayfaY: {label:'Sayfa Y', type: Number, min: 1, defaultValue: 297, max: 594},
          etiketX: {label:'Etiket X', type: Number, min: 40, defaultValue: 52, max: 100},
          etiketY: {label:'Etiket Y', type: Number, min: 23, defaultValue: 23, max: 75},
          boslukX: {label:'Boşluk X', type: Number, min: 0, defaultValue: 0, max: 20},
          boslukY: {label:'Boşluk Y', type: Number, min: 0, defaultValue: 10, max: 20},
          kaydir: {label:'Kaydır', type: Number, min: 0, defaultValue: 0, max: 50},
        })}
        onSubmit={this.printPage}
      >
        <Row>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <NumberField
              className="text-center"
              showInlineError
              name="sayfaX"
            />
          </Col>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <NumberField
              className="text-center"
              showInlineError
              name="sayfaY"
            />
          </Col>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <NumberField
              className="text-center"
              showInlineError
              name="etiketX"
            />
          </Col>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <NumberField
              className="text-center"
              showInlineError
              name="etiketY"
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <NumberField
              className="text-center"
              showInlineError
              name="boslukX"
            />
          </Col>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <NumberField
              className="text-center"
              showInlineError
              name="boslukY"
            />
          </Col>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <NumberField
              className="text-center"
              showInlineError
              name="kaydir"
            />
          </Col>
          <Col xs={6} sm={3} className="searchContainer text-center">
            <SubmitField value="Yazdır" inputClassName="btn btn-success"/>
          </Col>
        </Row>
      </AutoForm>
    </Well>

  }

}
