import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import { Container, PageHeader } from '/imports/client/components';
import { Bakiye, Kasalar, Kurlar } from '/imports/api/model';

export default createContainer(props => {

  const kasa = ((Bakiye.Kasa.find().fetch().reduce((toplam, bakiye) =>
    toplam + (bakiye.tutarX100 * Kurlar.findOne({tarih: Date.today()})[Kasalar.findOne(bakiye.kasa).kur])
    , 0) || 0) / 100);

  const alacak = Math.abs(((Bakiye.Cari.find({tutarX100TL: {$lt: 0}}).fetch().reduce((toplam, bakiye) =>
    toplam + bakiye.tutarX100TL
    , 0) || 0) / 100));

  const borc = ((Bakiye.Cari.find({tutarX100TL: {$gt: 0}}).fetch().reduce((toplam, bakiye) =>
    toplam + bakiye.tutarX100TL
    , 0) || 0) / 100);

  const records = [
    {
      baslik: 'Kasa mevcudu',
      deger: kasa.toCurrencyDisplay(),
    },
    {
      baslik: 'Toplam alacak',
      deger: alacak.toCurrencyDisplay(),
    },
    {
      baslik: 'Toplam borç',
      deger: borc.toCurrencyDisplay(),
    },
    {
      baslik: 'Cari bakiye',
      deger: ( ( (kasa * 100) + (alacak * 100) - (borc * 100) ) / 100 ).toCurrencyDisplay(),
    },
  ];

  return {
    records,
  }

}, class Ozet extends Component {

  render() {

    const {records} = this.props;

    return <Container yetki={this.props.route.yetki}>
      <PageHeader title="Özet" hideAddButton={true} />
      <Row>
        <Col xs={12}>
          <Table striped hover>
            <tbody>
            {
              records.map((record, ix) =>
                <tr key={ix}>
                  <td>{record.baslik}</td>
                  <td className="text-right">{record.deger}</td>
                </tr>
              )
            }
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>;

  }

})
