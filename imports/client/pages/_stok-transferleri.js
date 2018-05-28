import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField, DateTimeField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, TableRowButtons, PageHeader, PageFooter } from '/imports/client/components';
import { StokTransferleri, Konumlar, Urunler } from '/imports/api/model';
import { urun } from '/imports/api/methods';
import { StokTransferiModal as modal } from '/imports/client/modals';
import { LIMIT, YETKILER } from '/imports/environment/meta';
import debounce from '/imports/utils/debounce';
import SimpleSchema from 'simpl-schema';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default withTracker(props => {

  const subscriptionsReady = [
    Meteor.subscribe('stokTransferleri', {selectorOptions: selectorOptions.get(), limit: limit.get()}),
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
      selector.$and.push({ adet: compare });
    }

    if (options.urun) {
      selector.$and.push({ urun: options.urun });
    }

    if (options.konumKaynak) {
      selector.$and.push({ konumKaynak: options.konumKaynak });
    }

    if (options.konumHedef) {
      selector.$and.push({ konumHedef: options.konumHedef });
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

  const cursor = StokTransferleri.find(selector, {sort: {islemTarihi: -1, urun: 1, createdAt: -1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

})(class StokTransferleri extends Component {

  constructor(props) {
    super(props);
    limit.set(LIMIT);
    selectorOptions.set({});
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
      urun: doc.urun,
      konumKaynak: doc.konumKaynak,
      konumHedef: doc.konumHedef,
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

    return <Container yetki={this.props.yetki}>
      <PageHeader title="Stok transferleri" toggleSearchPane={this.toggleSearchPane} modalOpen={this.modalOpen} dokumPath="StokTransferleri" />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              iptal: {type: Boolean, optional: true},
              urun: {type: String, optional: true},
              konumKaynak: {type: String, optional: true},
              konumHedef: {type: String, optional: true},
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
                    name="urun"
                    placeholder="Ürün"
                    multi={false}
                    method={{
                      name: urun.select,
                      args: {
                        sadeceStokTakipliUrunler: true,
                      }
                    }}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="konumKaynak"
                    placeholder="Kaynak konum"
                    multi={false}
                    options={Konumlar.selectOptions()}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="konumHedef"
                    placeholder="Hedef konum"
                    multi={false}
                    options={Konumlar.selectOptions()}
                  />
                </Col>
              </Row>
              <Row>
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
                <Col sm={4} className="searchContainer">
                  <DateTimeField
                    label={false}
                    placeholder="Başlangıç"
                    isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                    showInlineError
                    name="islemTarihiBegin" />
                </Col>
                <Col sm={4} className="searchContainer">
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
              <th>Ürün</th>
              <th>Kaynak konum</th>
              <th>Hedef konum</th>
              <th className="text-right">Adet</th>
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
                      <td data-th="Ürün">{record.urunLabel()}</td>
                      <td data-th="Kaynak konum">{record.konumKaynakLabel()}</td>
                      <td data-th="Hedef konum">{record.konumHedefLabel()}</td>
                      <td data-th="Adet" className="text-right noWrap">{record.adet === 0 ? 'iptal' : record.adet}</td>
                      <TableRowButtons yetkiUpdate={YETKILER.URUNLER.value} modalOpen={this.modalOpen} record={record} />
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
