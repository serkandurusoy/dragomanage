import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, TableRowButtons, PageHeader, PageFooter } from '/imports/client/components';
import { Urunler, Etiketler, Siniflar } from '/imports/api/model';
import { UrunModal as modal } from '/imports/client/modals';
import { ETIKETLER, URUNLER, SINIFLAR } from '/imports/environment/enums';
import { LIMIT, YETKILER } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import debounce from '/imports/utils/debounce';
import SimpleSchema from 'simpl-schema';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default withTracker(props => {

  const subscriptionsReady = [
    Meteor.subscribe('urunler', {selectorOptions: selectorOptions.get(), limit: limit.get()}),
  ].every(subscription => subscription.ready());

  let selector = buildKeywordRegexSelector(selectorOptions.get().keyword, ['isim', 'markaLabel', 'barkod'], {});

  if (selectorOptions.get().etiketler && selectorOptions.get().etiketler.length > 0) {
    selector.etiketler = {
      $in: selectorOptions.get().etiketler,
    }
  }

  if (selectorOptions.get().tip && selectorOptions.get().tip.length > 0) {
    selector.tip = selectorOptions.get().tip;
  }

  if (selectorOptions.get().sinif && selectorOptions.get().sinif.length > 0) {
    selector.sinif = selectorOptions.get().sinif;
  }

  if (typeof selectorOptions.get().satilabilir === 'boolean') {
    selector.satilabilir = selectorOptions.get().satilabilir;
  }

  const cursor = Urunler.find(selector, {sort: {isim: 1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

})(class Urunler extends Component {

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
      keyword: doc.keyword,
      tip: doc.tip,
      etiketler: doc.etiketler,
      sinif: doc.sinif,
      satilabilir: doc.satilabilir,
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
      <PageHeader title="Ürünler" toggleSearchPane={this.toggleSearchPane} modalOpen={this.modalOpen} dokumPath="Urunler" />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              etiketler: {type: Array, optional: true},'etiketler.$':{type:String},
              keyword: {type: String, optional: true},
              tip: {type: String, optional: true},
              sinif: {type: String, optional: true},
              satilabilir: {type: Boolean, optional: true},
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col xs={12}>
              <Row>
                <Col sm={4} className="searchContainer">
                  <TextField autofocus name="keyword" label={false} placeholder="İsim, marka veya barkod" />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="tip"
                    placeholder="Tip"
                    multi={false}
                    options={Object.keys(URUNLER).map(v => URUNLER[v])}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="etiketler"
                    placeholder="Etiketler"
                    multi={true}
                    options={Etiketler.selectOptions(ETIKETLER.URUN.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={8} className="searchContainer">
                  <SelectField
                    label={false}
                    name="sinif"
                    placeholder="Sınıf"
                    multi={false}
                    options={Siniflar.selectOptions(SINIFLAR.SINIF.value)}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="satilabilir"
                    placeholder="Satılabilirlik"
                    multi={false}
                    options={[
                      {value: true, label: 'Satılabilir'},
                      {value: false, label: 'Satılamaz'},
                    ]}
                  />
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
              <th>İsim</th>
              <th>Tip</th>
              <th>Sınıf</th>
              <th>Etiketler</th>
              <th>Satılabilir</th>
              <th>Aktif</th>
              <th className="table-buttons"></th>
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                ? (!subscriptionsLoading && <TableRowEmpty colSpan={7}/>)
                : records.map(record =>
                    <tr key={record._id}>
                      <td data-th="İsim">{record.label()}</td>
                      <td data-th="Tip" className="noWrap">{record.tip.enumValueToLabel(URUNLER)}</td>
                      <td data-th="Sınıf">{Siniflar.findOne(record.sinif).label()}</td>
                      <td data-th="Etiketler">{record.etiketLabels().join(', ')}</td>
                      <td data-th="Satılabilir" className="noWrap">{record.satilabilir ? 'Evet' : 'Hayır'}</td>
                      <td data-th="Aktif" className="noWrap">{record.aktif ? 'Evet' : 'Hayır'}</td>
                      <TableRowButtons yetkiUpdate={YETKILER.URUNLER.value} modalOpen={this.modalOpen} record={record} />
                    </tr>
                  )
              }
              {
                subscriptionsLoading && <TableRowLoading colSpan={7}/>
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
