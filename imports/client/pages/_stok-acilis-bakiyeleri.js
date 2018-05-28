import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, PageHeader, PageFooter } from '/imports/client/components';
import { Urunler, Etiketler, Siniflar, Bakiye, Konumlar } from '/imports/api/model';
import { ETIKETLER, URUNLER, SINIFLAR } from '/imports/environment/enums';
import { LIMIT } from '/imports/environment/meta';
import buildKeywordRegexSelector from '/imports/utils/build-keyword-regex-selector';
import debounce from '/imports/utils/debounce';
import SimpleSchema from 'simpl-schema';

const selectorOptions = new ReactiveVar({});
const limit = new ReactiveVar(LIMIT);

export default withTracker(props => {

  const subscriptionsReady = [
    Meteor.subscribe('stokAcilisBakiyeleri', {selectorOptions: selectorOptions.get(), limit: limit.get()}),
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

  selector._id = {
    $in: Bakiye.Stok.Acilis.find({adet: {$ne: 0}}, {fields: {urun: 1}}).map(b => b.urun),
  };

  const cursor = Urunler.find(selector, {sort: {isim: 1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
    konumlar: Bakiye.Stok.Acilis.find({adet: {$ne: 0}}, {fields: {konum: 1}})
      .map(b => b.konum)
      .filter((k,ix,arr) => arr.indexOf(k) === ix)
      .map(k => ({
        _id: k,
        label: Konumlar.findOne(k).label()
      })),
};

})(class StokAcilisBakiyeleri extends Component {

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
      konumlar,
    } = this.props;

    return <Container yetki={this.props.yetki}>
      <PageHeader title="Stok açılış bakiyeleri" toggleSearchPane={this.toggleSearchPane} hideAddButton={true} />
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
            })}
            onChangeModel={model => this.search(model)}
          >
            <Col xs={12}>
              <Row>
                <Col sm={6} className="searchContainer">
                  <TextField autofocus name="keyword" label={false} placeholder="İsim, marka veya barkod" />
                </Col>
                <Col sm={6} className="searchContainer">
                  <SelectField
                    label={false}
                    name="tip"
                    placeholder="Tip"
                    multi={false}
                    options={Object.keys(URUNLER).map(v => URUNLER[v])}
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
                    name="etiketler"
                    placeholder="Etiketler"
                    multi={true}
                    options={Etiketler.selectOptions(ETIKETLER.URUN.value)}
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
              {
                konumlar.map(k => <th className="text-center" key={k._id}>{k.label}</th>)
              }
            </tr>
            </thead>
            <tbody>
              {
                records.length === 0
                ? (!subscriptionsLoading && <TableRowEmpty colSpan={1 + konumlar.length}/>)
                : records.map(record =>
                    <tr key={record._id}>
                      <td data-th="İsim">{record.label()}</td>
                      {
                        konumlar.map(k =>
                          <td className="text-center" data-th={k.label} key={k._id}>
                            {
                              record.bakiyeAcilisArray().find(b => b.konum === k._id)
                                ? record.bakiyeAcilisArray().find(b => b.konum === k._id).adet
                                : 0
                            }
                          </td>
                        )
                      }
                    </tr>
                  )
              }
              {
                subscriptionsLoading && <TableRowLoading colSpan={1 + konumlar.length}/>
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
