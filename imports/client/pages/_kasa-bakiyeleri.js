import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, PageHeader, PageFooter } from '/imports/client/components';
import { Kasalar } from '/imports/api/model';
import { KASALAR, KURLAR } from '/imports/environment/enums';
import { LIMIT } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import debounce from '/imports/utils/debounce';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default createContainer(props => {

  let selector = buildKeywordRegexSelector(selectorOptions.get().keyword, ['isim'], {});

  if (selectorOptions.get().tip && selectorOptions.get().tip.length > 0) {
    selector.tip = selectorOptions.get().tip;
  }

  if (selectorOptions.get().kur && selectorOptions.get().kur.length > 0) {
    selector.kur = selectorOptions.get().kur;
  }

  const cursor = Kasalar.find(selector, {sort: {tip: 1, isim: 1}, limit: limit.get()});

  return {
    subscriptionsLoading: false,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

}, class KasaBakiyeleri extends Component {

  constructor(props) {
    super(props);
    limit.set(LIMIT);
    this.search = debounce(this.search, 300);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { records } = nextProps;
    return records && records.length > 0;
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
      kur: doc.kur,
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
      <PageHeader title="Kasa bakiyeleri" toggleSearchPane={this.toggleSearchPane} hideAddButton={true}/>
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              keyword: {type: String, optional: true},
              tip: {type: String, optional: true},
              kur: {type: String, optional: true},
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col sm={4} className="searchContainer">
              <TextField name="keyword" label={false} placeholder="İsim" />
            </Col>
            <Col sm={4} className="searchContainer">
              <SelectField
                label={false}
                name="tip"
                placeholder="Tip"
                multi={false}
                options={Object.keys(KASALAR).map(v => KASALAR[v])}
              />
            </Col>
            <Col sm={4} className="searchContainer">
              <SelectField
                label={false}
                name="kur"
                placeholder="Kur"
                multi={false}
                options={Object.keys(KURLAR).map(v => KURLAR[v])}
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
              <th>Tip</th>
              <th>Kur</th>
              <th>İsim</th>
              <th className="text-right">Bakiye</th>
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                  ? (!subscriptionsLoading && <TableRowEmpty colSpan={4}/>)
                  : records.map(record =>
                      <tr key={record._id}>
                        <td data-th="Tip" className="noWrap">{record.tip.enumValueToLabel(KASALAR)}</td>
                        <td data-th="Kur" className="noWrap">{record.kur.enumValueToLabel(KURLAR)}</td>
                        <td data-th="İsim">{record.isim}</td>
                        <td data-th="Bakiye" className="text-right noWrap">{record.kur !== KURLAR.TRY.value ? `(${record.bakiyeLabel()}) ` : ''}{record.bakiyeLabelTL()}</td>
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
