import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField, DateTimeField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, TableRowButtons, PageHeader, PageFooter } from '/imports/client/components';
import { KasaTransferleri, Kasalar } from '/imports/api/model';
import { KasaTransferiModal as modal } from '/imports/client/modals';
import { LIMIT, YETKILER } from '/imports/environment/meta';
import debounce from '/imports/utils/debounce';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default createContainer(props => {

  const subscriptionsReady = [
    Meteor.subscribe('kasaTransferleri', {selectorOptions: selectorOptions.get(), limit: limit.get()}),
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

    if (typeof options.iptal === 'boolean') {
      let compare = {};
      if (options.iptal) {
        compare.$eq = 0;
      } else {
        compare.$gt = 0;
      }
      selector.$and.push({ tutarX100: compare });
    }

    if (options.kasaKaynak) {
      selector.$and.push({ kasaKaynak: options.kasaKaynak });
    }

    if (options.kasaHedef) {
      selector.$and.push({ kasaHedef: options.kasaHedef });
    }

    if (options.islemTarihiBegin) {
      selector.$and.push({ islemTarihi: { $gte: options.islemTarihiBegin} });
    }

    if (options.islemTarihiEnd) {
      selector.$and.push({ islemTarihi: { $lte: options.islemTarihiEnd.add(1,'d')} });
    }

  }

  if (selector.$and && selector.$and.length === 0) {
    selector = {};
  }

  const cursor = KasaTransferleri.find(selector, {sort: {islemTarihi: -1, createdAt: -1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

}, class KasaTransferleri extends Component {

  constructor(props) {
    super(props);
    limit.set(LIMIT);
    this.search = debounce(this.search, 300);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { subscriptionsLoading, count } = nextProps;
    if (!subscriptionsLoading && count === 0) {
      return true;
    }
    return count > 0;
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
      iptal: doc.iptal,
      kasaKaynak: doc.kasaKaynak,
      kasaHedef: doc.kasaHedef,
      islemTarihiBegin: doc.islemTarihiBegin,
      islemTarihiEnd: doc.islemTarihiEnd,
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
      <PageHeader title="Kasa transferleri" toggleSearchPane={this.toggleSearchPane} modalOpen={this.modalOpen} dokumPath="KasaTransferleri" />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              iptal: {type: Boolean, optional: true},
              kasaKaynak: {type: String, optional: true},
              kasaHedef: {type: String, optional: true},
              islemTarihiBegin: {type: Date, optional: true},
              islemTarihiEnd: {type: Date, optional: true, custom() {
                const islemTarihiBegin = this.field('islemTarihiBegin');
                const islemTarihiEnd = this;
                if (islemTarihiBegin.isSet && islemTarihiEnd.isSet) {
                  if (islemTarihiEnd.value.isBefore(islemTarihiBegin.value)) {
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
                    autofocus
                    label={false}
                    name="kasaKaynak"
                    placeholder="Kaynak kasa"
                    multi={false}
                    options={Kasalar.selectOptions()}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="kasaHedef"
                    placeholder="Hedef kasa"
                    multi={false}
                    options={Kasalar.selectOptions()}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="iptal"
                    placeholder="İptal edilmiş"
                    multi={false}
                    options={[
                      {value: true, label: 'Evet'},
                      {value: false, label: 'Hayır'},
                    ]}
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
                    name="islemTarihiBegin" />
                </Col>
                <Col sm={6} className="searchContainer">
                  <DateTimeField
                    label={false}
                    placeholder="Bitiş"
                    isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                    showInlineError
                    name="islemTarihiEnd" />
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
              <th>Kaynak kasa</th>
              <th>Hedef kasa</th>
              <th className="text-right">Döviz</th>
              <th className="text-right">Tutar</th>
              <th className="table-buttons"></th>
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                ? (!subscriptionsLoading && <TableRowEmpty colSpan={6}/>)
                : records.map(record =>
                    <tr key={record._id}>
                      <td data-th="Tarih" className="noWrap">{record.islemTarihi.toFormattedDate()}</td>
                      <td data-th="Kaynak kasa">{record.kasaKaynakLabel()}</td>
                      <td data-th="Hedef kasa">{record.kasaHedefLabel()}</td>
                      <td data-th="Döviz" className="text-right noWrap">{record.tutarX100 === record.tutarX100TL ? '' : record.tutarLabel()}</td>
                      <td data-th="Tutar" className="text-right noWrap">{record.tutarX100TL === 0 ? 'iptal' : record.tutarLabelTL()}</td>
                      <TableRowButtons yetkiUpdate={YETKILER.MUHASEBE.value} modalOpen={this.modalOpen} record={record} />
                    </tr>
                  )
              }
              {
                subscriptionsLoading && <TableRowLoading colSpan={6}/>
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
