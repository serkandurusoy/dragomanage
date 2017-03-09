import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField, DateTimeField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, TableRowButtons, PageHeader, PageFooter } from '/imports/client/components';
import { Talepler, Kullanicilar } from '/imports/api/model';
import { TalepModal as modal } from '/imports/client/modals';
import { LIMIT, YETKILER } from '/imports/environment/meta';
import { TALEPLER } from '/imports/environment/enums';
import debounce from '/imports/utils/debounce';
import { cariKart, urun } from '/imports/api/methods';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default createContainer(props => {

  const subscriptionsReady = [
    Meteor.subscribe('talepler', {selectorOptions: selectorOptions.get(), limit: limit.get()}),
  ].every(subscription => subscription.ready());

  let selector = {};
  let options = selectorOptions.get();
  Object.keys(options).forEach(o => (
      typeof options[o] === 'undefined' ||
      options[o] === ''
    ) && delete options[o]
  );

  if (Object.keys(options).length > 0) {
    selector.$and = [];

    if (typeof options.islendi === 'boolean') {
      selector.$and.push({ islendi: options.islendi });
    }

    if (options.islem) {
      selector.$and.push({ islem: options.islem });
    }

    if (options.cariKart) {
      selector.$and.push({ cariKart: options.cariKart });
    }

    if (options.urun) {
      selector.$and.push({ urun: options.urun });
    }

    if (options.reference) {
      selector.$and.push({ reference: options.reference });
    }

    if (options.kaydeden) {
      selector.$and.push({ kaydeden: options.kaydeden });
    }

    if (options.createdAtBegin) {
      selector.$and.push({ createdAt: { $gte: options.createdAtBegin} });
    }

    if (options.createdAtEnd) {
      selector.$and.push({ createdAt: { $lte: options.createdAtEnd.add(1,'d')} });
    }

  }

  if (selector.$and && selector.$and.length === 0) {
    selector = {};
  }

  const cursor = Talepler.find(selector, {sort: {createdAt: -1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

}, class Talepler extends Component {

  constructor(props) {
    super(props);
    limit.set(LIMIT);
    this.search = debounce(this.search, 300);
  }

  state = {
    modal: null,
    searchPane: false,
  }

  toggleSearchPane = (e) => {
    if (e) e.preventDefault();
    limit.set(LIMIT);
    selectorOptions.set({});
    this.setState({searchPane: !this.state.searchPane});
  }

  search = (doc) => {
    selectorOptions.set({
      islendi: doc.islendi,
      islem: doc.islem,
      cariKart: doc.cariKart,
      urun: doc.urun,
      reference: doc.reference,
      kaydeden: doc.kaydeden,
      createdAtBegin: doc.createdAtBegin,
      createdAtEnd: doc.createdAtEnd,
    });
  }

  loadMore = (e) => {
    if (e) e.preventDefault();
    limit.set(limit.get() + LIMIT);
  }

  modalOpen = (e, record = {}, operation) => {
    if (e) e.preventDefault();
    this.setState({
      modal: {
        operation,
        record,
      }
    });
  }

  modalClose = (e) => {
    if (e) e.preventDefault();
    this.setState({modal: null});
  }

  render() {
    const {
      subscriptionsLoading,
      records,
      count,
    } = this.props;

    return <Container yetki={this.props.route.yetki}>
      <PageHeader title="Talepler" toggleSearchPane={this.toggleSearchPane} modalOpen={this.modalOpen} />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              islendi: {type: Boolean, optional: true},
              islem: {type: String, optional: true},
              cariKart: {type: String, optional: true},
              urun: {type: String, optional: true},
              reference: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
              kaydeden: {type: String, optional: true},
              createdAtBegin: {type: Date, optional: true},
              createdAtEnd: {type: Date, optional: true, custom() {
                const createdAtBegin = this.field('createdAtBegin');
                const createdAtEnd = this;
                if (createdAtBegin.isSet && createdAtEnd.isSet) {
                  if (createdAtEnd.value.isBefore(createdAtBegin.value)) {
                    return 'endDateMustBeLater';
                  }
                }
              }},
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col xs={12}>
              <Row>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="kaydeden"
                    placeholder="Kaydeden"
                    multi={false}
                    options={Kullanicilar
                      .find({gizli: false}, {sort: {ad:1, soyad: 1}})
                      .map(v => ({value: v._id, label: v.isim()}))
                    }
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="islendi"
                    placeholder="İşlenmiş"
                    multi={false}
                    options={[
                      {value: true, label: 'Evet'},
                      {value: false, label: 'Hayır'},
                    ]}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <TextField
                    showInlineError
                    name="reference"
                    label={false}
                    placeholder="Referans"
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={5} className="searchContainer">
                  <SelectField
                    label={false}
                    name="cariKart"
                    placeholder="Cari kart"
                    multi={false}
                    method={{name: cariKart.select}}
                  />
                </Col>
                <Col sm={5} className="searchContainer">
                  <SelectField
                    label={false}
                    name="urun"
                    placeholder="Ürün"
                    multi={false}
                    method={{
                      name: urun.select,
                    }}
                  />
                </Col>
                <Col sm={2} className="searchContainer">
                  <SelectField
                    label={false}
                    name="islem"
                    placeholder="İşlem"
                    multi={false}
                    options={Object.keys(TALEPLER).map(v => TALEPLER[v])}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={6} className="searchContainer">
                  <DateTimeField
                    label={false}
                    placeholder="Başlangıç"
                    isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                    showInlineError
                    name="createdAtBegin" />
                </Col>
                <Col sm={6} className="searchContainer">
                  <DateTimeField
                    label={false}
                    placeholder="Bitiş"
                    isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                    showInlineError
                    name="createdAtEnd" />
                </Col>
              </Row>
            </Col>
          </AutoForm>
        </Row>
      }
      <Row>
        <Col xs={12}>
          <Table className="customResponsive" striped hover>
            <thead>
            <tr>
              <th>Tarih</th>
              <th>Kaydeden</th>
              <th>Cari kart</th>
              <th>Ürün</th>
              <th className="text-right">Döviz</th>
              <th className="text-right">Tutar</th>
              <th className="text-right">İşlendi</th>
              <th className="table-buttons"></th>
            </tr>
            </thead>
            <tbody>
            {
              records.length === 0
                ? (!subscriptionsLoading && <TableRowEmpty colSpan={8}/>)
                : records.map(record =>
                  <tr key={record._id}>
                    <td data-th="Tarih" className="noWrap">{record.createdAt && record.createdAt.toFormattedDate()}</td>
                    <td data-th="Kaydeden">{record.kullanici()}</td>
                    <td data-th="Cari kart">{record.cariKartLabel()}</td>
                    <td data-th="Ürün">{record.urunLabel()}</td>
                    <td data-th="Döviz" className="text-right noWrap">{record.tutarX100 === record.tutarX100TL ? '' : record.tutarLabel()}</td>
                    <td data-th="Tutar" className="text-right noWrap">{record.tutarLabelTL()}</td>
                    <td data-th="İşlendi" className="text-right noWrap">{record.islendi ? 'Evet' : ''}</td>
                    <TableRowButtons yetkiUpdate={YETKILER.MUHASEBE.value} modalOpen={this.modalOpen} record={record} />
                  </tr>
                )
            }
            {
              subscriptionsLoading && <TableRowLoading colSpan={8}/>
            }
            </tbody>
          </Table>
        </Col>
      </Row>
      <PageFooter
        subscriptionsLoading={subscriptionsLoading}
        count={count}
        loadMore={this.loadMore}
        modal={modal}
        data={this.state.modal}
        close={this.modalClose} />
    </Container>;
  }

})
