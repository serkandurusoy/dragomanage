import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data'
import { Row, Col, Table, Button } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField, DateTimeField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, PageHeader, PageFooter, Image } from '/imports/client/components';
import { Timeline, Kullanicilar } from '/imports/api/model';
import * as modals from '/imports/client/modals';
import { LIMIT, COLLECTIONS } from '/imports/environment/meta';
import FontAwesome from 'react-fontawesome';
import debounce from '/imports/utils/debounce';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default createContainer(props => {

  const subscriptionsReady = [
    Meteor.subscribe('timeline', {selectorOptions: selectorOptions.get(), limit: limit.get()}),
  ].every(subscription => subscription.ready());

  let selector = {};
  let options = selectorOptions.get();
  Object.keys(options).forEach(o => !options[o] && delete options[o]);

  if (Object.keys(options).length > 0) {
    selector.$and = [];

    if (options.reference) {
      selector.$and.push({ references: options.reference });
    }

    if (options.collection) {
      selector.$and.push({ collection: options.collection });
    }

    if (options.operation) {
      selector.$and.push({ operation: options.operation });
    }

    if (options.recordedBy) {
      selector.$and.push({ recordedBy: options.recordedBy });
    }

    if (options.recordedAtBegin) {
      selector.$and.push({ recordedAt: { $gte: options.recordedAtBegin} });
    }

    if (options.recordedAtEnd) {
      selector.$and.push({ recordedAt: { $lte: options.recordedAtEnd.add(1,'d')} });
    }

  }

  const cursor = Timeline.find(selector, {sort: {recordedAt: -1, collection: 1, operation: 1, references: 1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
    reference: selectorOptions.get().reference,
  };

}, class Timeline extends Component {

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
    modalComponent: null,
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
      reference: doc.reference,
      collection: doc.collection,
      operation: doc.operation,
      recordedBy: doc.recordedBy,
      recordedAtBegin: doc.recordedAtBegin,
      recordedAtEnd: doc.recordedAtEnd,
    });
  }

  loadMore = (e) => {
    if (e) e.preventDefault();
    limit.set(limit.get() + LIMIT);
  }

  modalOpen = (e, record = {}, operation, modalComponent) => {
    if (e) e.preventDefault();
    this.setState({
      modalComponent,
      modal: {
        operation,
        record,
      }
    });
  }

  modalClose = (e) => {
    if (e) e.preventDefault();
    this.setState({modalComponent: null, modal: null});
  }

  render() {
    const {
      subscriptionsLoading,
      records,
      count,
      reference,
    } = this.props;

    return <Container yetki={this.props.route.yetki}>
      <PageHeader title="İşlem geçmişi" hideAddButton={true} toggleSearchPane={this.toggleSearchPane} />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              reference: {type:String, optional: true},
              collection: {type:String, optional: true},
              operation: {type: String, optional: true},
              recordedBy: {type: String, optional: true},
              recordedAtBegin: {type: Date, optional: true},
              recordedAtEnd: {type: Date, optional: true, custom() {
                const recordedAtBegin = this.field('recordedAtBegin');
                const recordedAtEnd = this;
                if (recordedAtBegin.isSet && recordedAtEnd.isSet) {
                  if (recordedAtEnd.value.isBefore(recordedAtBegin.value)) {
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
                  <TextField
                    autofocus
                    showInlineError
                    name="reference"
                    label={false}
                    placeholder="Referans / Dosya no"
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="collection"
                    placeholder="Veri"
                    multi={false}
                    options={Object.keys(COLLECTIONS).map(v => COLLECTIONS[v])}
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="recordedBy"
                    placeholder="Kaydeden"
                    multi={false}
                    options={Kullanicilar
                      .find({gizli: false}, {sort: {ad:1, soyad: 1}})
                      .map(v => ({value: v.user() ? v.user()._id : v._id, label: v.isim()}))
                      .concat([{value: 'sistem', label: 'Dragomanage Sistemi'}])
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="operation"
                    placeholder="İşlem"
                    multi={false}
                    options={ [ {value: 'insert', label: 'Ekleme'}, {value: 'update', label: 'Güncelleme'} ] }
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <DateTimeField
                    label={false}
                    placeholder="Başlangıç"
                    isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                    showInlineError
                    name="recordedAtBegin" />
                </Col>
                <Col sm={4} className="searchContainer">
                  <DateTimeField
                    label={false}
                    placeholder="Bitiş"
                    isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                    showInlineError
                    name="recordedAtEnd" />
                </Col>
              </Row>
            </Col>
          </AutoForm>
        </Row>
      }
      <Row>
        <Col xs={12}>
          <Table className="customResponsive" striped hover>
            <tbody>
            {
              records.length === 0
                ? (!subscriptionsLoading && <TableRowEmpty colSpan={2}/>)
                : records.map(record =>
                  <tr key={record._id} className="timeline">
                    <td data-th="">
                      <Image src={record.resim()} errorSrc="/user.png" circle className="width-25"/>
                      <p>
                        {record.operation === 'insert' ? 'Yeni bir' : 'Mevcut bir'} {record.operationLabel()} {record.operation === 'insert' ? 'eklendi.' : (record.version + '. versiyonuna güncellendi.') }
                        {' '}
                        {record.note}
                        {' '}
                        {
                          record.daysFromRecord > 30
                            ? <span className="oldDoc veryOld">Dikkat! Bu işlem bir aydan daha eski bir kayda ait.</span>
                            : record.daysFromRecord > 7
                            ? <span className="oldDoc">Bu işlem bir haftadan eski bir kayda ait.</span>
                            : ''
                        }
                        <br/>
                        <small>
                          {record.recordedAt.toFormattedTime()} - {record.kullanici()}
                          <code className={`timeline-reference${reference === record.doc ? ' timeline-matching-reference' : ''}`}>Referans: {record.doc}</code>
                        </small>
                      </p>
                    </td>
                    <td data-th="" className="table-buttons" >
                      {
                        record.currentUserYetkili() && <div>
                          < Button bsStyle="warning" bsSize="xsmall"
                                   onClick={e => this.modalOpen(e, {_id: record.doc}, 'update', modals[record.modalComponent()])} >
                            <FontAwesome name='pencil' />
                          </Button>
                          {' '}
                          <Button bsStyle="primary" bsSize="xsmall" onClick={e => this.modalOpen(e, {_id: record.doc}, 'static', modals[record.modalComponent()])}>
                            <FontAwesome name='info-circle' />
                          </Button>
                        </div>
                      }
                    </td>
                  </tr>
                )
            }
            {
              subscriptionsLoading && <TableRowLoading colSpan={2}/>
            }
            </tbody>
          </Table>
        </Col>
      </Row>
      <PageFooter
        subscriptionsLoading={subscriptionsLoading}
        count={count}
        loadMore={this.loadMore}
        modal={this.state.modalComponent}
        data={this.state.modal}
        close={this.modalClose} />
    </Container>;
  }

})
