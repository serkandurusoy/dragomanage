import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, PageHeader, PageFooter } from '/imports/client/components';
import { CariKartlar, Etiketler, Bakiye } from '/imports/api/model';
import { ETIKETLER, CARI_KARTLAR } from '/imports/environment/enums';
import { LIMIT } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import debounce from '/imports/utils/debounce';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default withTracker(props => {

  const subscriptionsReady = [
    Meteor.subscribe('cariBakiyeler', {selectorOptions: selectorOptions.get(), limit: limit.get()}),
  ].every(subscription => subscription.ready());

  let selector = buildKeywordRegexSelector(selectorOptions.get().keyword, ['unvan', 'kisaIsim'], {});

  if (selectorOptions.get().etiketler && selectorOptions.get().etiketler.length > 0) {
    selector.etiketler = {
      $in: selectorOptions.get().etiketler,
    }
  }

  if (selectorOptions.get().tip && selectorOptions.get().tip.length > 0) {
    selector.tip = selectorOptions.get().tip;
  }

  selector._id = {
    $in: Bakiye.Cari.find({tutarX100TL: {$ne: 0}}, {fields: {cariKart: 1}}).map(b => b.cariKart),
  };

  const cursor = CariKartlar.find(selector, {sort: {kisaIsim: 1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

})(class CariBakiyeler extends Component {

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
      keyword: doc.keyword,
      tip: doc.tip,
      etiketler: doc.etiketler,
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
      <PageHeader title="Cari bakiyeler" toggleSearchPane={this.toggleSearchPane} hideAddButton={true} />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              etiketler: {type: [String], optional: true},
              keyword: {type: String, optional: true},
              tip: {type: String, optional: true},
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col sm={4} className="searchContainer">
              <TextField autofocus name="keyword" label={false} placeholder="İsim veya ünvan" />
            </Col>
            <Col sm={4} className="searchContainer">
              <SelectField
                label={false}
                name="tip"
                placeholder="Tip"
                multi={false}
                options={Object.keys(CARI_KARTLAR).map(v => CARI_KARTLAR[v])}
              />
            </Col>
            <Col sm={4} className="searchContainer">
              <SelectField
                label={false}
                name="etiketler"
                placeholder="Etiketler"
                multi={true}
                options={Etiketler.selectOptions(ETIKETLER.CARI_KART.value)}
              />
            </Col>
          </AutoForm>
        </Row>
      }
      <Row>
        <Col xs={12}>
          <Table className="customResponsive" striped hover>
            <thead>
            <tr>
              <th>Kısa isim</th>
              <th>Tip</th>
              <th>Etiketler</th>
              <th className="text-right">Bakiye</th>
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                ? (!subscriptionsLoading && <TableRowEmpty colSpan={4}/>)
                : records.map(record =>
                    <tr key={record._id}>
                      <td data-th="Kısa isim">{record.kisaIsim}</td>
                      <td data-th="Tip" className="noWrap">{record.tip.enumValueToLabel(CARI_KARTLAR)}</td>
                      <td data-th="Etiketler">{record.etiketLabels().join(', ')}</td>
                      <td data-th="Bakiye" className="text-right noWrap">{record.bakiyeLabelTL()}</td>
                    </tr>
                  )
              }
              {
                subscriptionsLoading && <TableRowLoading colSpan={4}/>
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <PageFooter
        subscriptionsLoading={subscriptionsLoading}
        count={count}
        loadMore={this.loadMore} />
    </Container>;
  }

})
