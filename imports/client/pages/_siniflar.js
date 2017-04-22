import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, TableRowButtons, PageHeader, PageFooter } from '/imports/client/components';
import { Siniflar } from '/imports/api/model';
import { SinifModal as modal } from '/imports/client/modals';
import { SINIFLAR } from '/imports/environment/enums';
import { LIMIT, YETKILER } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import debounce from '/imports/utils/debounce';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default createContainer(props => {

  let selector = buildKeywordRegexSelector(selectorOptions.get().keyword, ['ustLabel','isim'], {});

  if (selectorOptions.get().tip && selectorOptions.get().tip.length > 0) {
    selector.tip = selectorOptions.get().tip;
  }

  const cursor = Siniflar.find(selector, {sort: {ustLabel:1, isim: 1}, limit: limit.get()});

  return {
    subscriptionsLoading: false,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

}, class Siniflar extends Component {

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
      <PageHeader title="Sınıflar" toggleSearchPane={this.toggleSearchPane} modalOpen={this.modalOpen}/>
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              keyword: {type: String, optional: true},
              tip: {type: String, optional: true},
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col sm={6} className="searchContainer">
              <TextField name="keyword" label={false} placeholder="Sınıf" />
            </Col>
            <Col sm={6} className="searchContainer">
              <SelectField
                label={false}
                name="tip"
                placeholder="Tip"
                multi={false}
                options={Object.keys(SINIFLAR).map(v => SINIFLAR[v])}
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
              <th>Üst</th>
              <th>İsim</th>
              <th>Aktif</th>
              <th className="table-buttons"></th>
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                  ? (!subscriptionsLoading && <TableRowEmpty colSpan={5}/>)
                  : records.map(record =>
                      <tr key={record._id}>
                        <td data-th="Tip" className="noWrap">{record.tip.enumValueToLabel(SINIFLAR)}</td>
                        <td data-th="Üst">{record.ustLabel || '---'}</td>
                        <td data-th="İsim" className="noWrap">{record.isim}</td>
                        <td data-th="Aktif" className="noWrap">{record.aktif ? 'Evet' : 'Hayır'}</td>
                        <TableRowButtons yetkiUpdate={YETKILER.TANIMLAR.value} modalOpen={this.modalOpen} record={record} />
                      </tr>
                    )
              }
              {
                subscriptionsLoading && <TableRowLoading colSpan={5}/>
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
