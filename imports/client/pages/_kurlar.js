import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import { Row, Col, Table, Button } from 'react-bootstrap';
import { AutoForm } from '/imports/client/components/uniforms-bootstrap3';
import { DateTimeField } from '/imports/client/components/uniforms-custom';
import FontAwesome from 'react-fontawesome';
import { Container, TableRowEmpty, TableRowLoading, PageHeader, KurHesaplayici } from '/imports/client/components';
import { Kurlar } from '/imports/api/model';
import { KURLAR } from '/imports/environment/enums';
import { LIMIT } from '/imports/environment/meta';
import debounce from '/imports/utils/debounce';
import SimpleSchema from 'simpl-schema';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default withTracker(props => {

  let selector = {};
  let options = selectorOptions.get();
  Object.keys(options).forEach(o => !options[o] && delete options[o]);

  if (Object.keys(options).length > 0) {
    selector.$and = [];

    if (options.begin) {
      selector.$and.push({ tarih: { $gte: options.begin} });
    }

    if (options.end) {
      selector.$and.push({ tarih: { $lte: options.end} });
    }

  }

  const cursor = Kurlar.find(selector, {sort: {tarih: -1}, limit: limit.get()});

  return {
    subscriptionsLoading: false,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

})(class Kurlar extends Component {

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
      begin: doc.begin,
      end: doc.end,
    });
  }

  loadMore = (e) => {
    if (e) e.preventDefault();
    limit.set(limit.get() + LIMIT);
  }

  render() {
    const {
      subscriptionsLoading,
      records,
      count,
    } = this.props;

    return <Container yetki={this.props.yetki}>
      <PageHeader title="Kurlar" toggleSearchPane={this.toggleSearchPane} hideAddButton={true} />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              begin: {type: Date, optional: true},
              end: {type: Date, optional: true, custom() {
                const begin = this.field('begin');
                const end = this;
                if (begin.isSet && end.isSet) {
                  if (end.value.isBefore(begin.value)) {
                    return 'endDateMustBeLater';
                  }
                }
              }},
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col sm={6} className="searchContainer">
              <DateTimeField
                label={false}
                placeholder="Başlangıç"
                isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                showInlineError
                timeFormat={false}
                name="begin" />
            </Col>
            <Col sm={6} className="searchContainer">
              <DateTimeField
                label={false}
                placeholder="Bitiş"
                isValidDate={v => v.isSameOrAfter(Date.sistemAcilis()) && v.isSameOrBefore(Date.today())}
                showInlineError
                timeFormat={false}
                name="end" />
            </Col>
          </AutoForm>
        </Row>
      }
      <Row>
        <Col xs={12}>
          <KurHesaplayici/>
          <Table className="customResponsive" striped hover>
            <thead>
            <tr>
              <th className="text-center">Tarih</th>
              <th className="text-center">{KURLAR.USD.label}</th>
              <th className="text-center">{KURLAR.EUR.label}</th>
              <th className="text-center">{KURLAR.GBP.label}</th>
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                  ? (!subscriptionsLoading && <TableRowEmpty colSpan={4}/>)
                  : records.map(record => <tr key={record._id}>
                        <td className="text-center" data-th="Tarih">{record.tarih.toFormattedDate()}</td>
                        <td className="text-center" data-th={KURLAR.USD.label}>{record[KURLAR.USD.value].toCurrencyDisplay(4)}</td>
                        <td className="text-center" data-th={KURLAR.EUR.label}>{record[KURLAR.EUR.value].toCurrencyDisplay(4)}</td>
                        <td className="text-center" data-th={KURLAR.GBP.label}>{record[KURLAR.GBP.value].toCurrencyDisplay(4)}</td>
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
      <Row>
        <Col xs={12} className="text-center">
          {
            !subscriptionsLoading && count >= LIMIT &&
            <Button bsStyle="link" onClick={this.loadMore} style={{marginBottom: 20}}>
              <FontAwesome name='arrow-circle-down' size="lg" /> Daha fazla
            </Button>
          }
        </Col>
      </Row>
    </Container>
  }

})
