import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, TableRowButtons, PageHeader, PageFooter } from '/imports/client/components';
import { Kullanicilar } from '/imports/api/model';
import { KullaniciModal as modal } from '/imports/client/modals';
import { LIMIT, ROLLER, YETKILER } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import debounce from '/imports/utils/debounce';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default createContainer(props => {

  let selector = buildKeywordRegexSelector(selectorOptions.get().keyword, ['ad', 'soyad'], {});

  if (selectorOptions.get().yetkiler && selectorOptions.get().yetkiler.length > 0) {
    selector.yetkiler = {
      $in: selectorOptions.get().yetkiler,
    }
  }

  if (selectorOptions.get().rol && selectorOptions.get().rol.length > 0) {
    selector.rol = selectorOptions.get().rol;
  }

  const cursor = Kullanicilar.find(selector, {sort: {ad: 1, soyad: 1}, limit: limit.get()});

  return {
    subscriptionsLoading: false,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

}, class Kullanicilar extends Component {

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
      keyword: doc.keyword,
      rol: doc.rol,
      yetkiler: doc.yetkiler,
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
      <PageHeader title="Kullanıcılar" toggleSearchPane={this.toggleSearchPane} modalOpen={this.modalOpen}/>
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              yetkiler: {type: [String], optional: true},
              keyword: {type: String, optional: true},
              rol: {type: String, optional: true},
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col sm={4} className="searchContainer">
              <TextField name="keyword" label={false} placeholder="Ad veya soyad" />
            </Col>
            <Col sm={4} className="searchContainer">
              <SelectField
                label={false}
                name="rol"
                placeholder="Rol"
                multi={false}
                options={Object.keys(ROLLER).map(v => ROLLER[v])}
              />
            </Col>
            <Col sm={4} className="searchContainer">
              <SelectField
                label={false}
                name="yetkiler"
                placeholder="Yetkiler"
                multi={true}
                options={Object.keys(YETKILER).map(v => YETKILER[v]).filter(yetki => !yetki.sistem)}
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
              <th>Aktif</th>
              <th>Ad</th>
              <th>Soyad</th>
              <th>Email</th>
              <th className="table-buttons"></th>
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                  ? (!subscriptionsLoading && <TableRowEmpty colSpan={5}/>)
                  : records.map(record =>
                      <tr key={record._id}>
                        <td data-th="Aktif" className="noWrap">{record.aktif ? 'Evet' : 'Hayır'}</td>
                        <td data-th="Ad">{record.ad}</td>
                        <td data-th="Soyad">{record.soyad}</td>
                        <td data-th="Email">{record.email}</td>
                        <TableRowButtons yetkiUpdate={YETKILER.SECRET.value} modalOpen={this.modalOpen} record={record} />
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
