import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Table } from 'react-bootstrap';
import { AutoForm, TextField } from '/imports/client/components/uniforms-bootstrap3';
import { SelectField, DateTimeField } from '/imports/client/components/uniforms-custom';
import { Container, TableRowEmpty, TableRowLoading, TableRowButtons, PageHeader, PageFooter } from '/imports/client/components';
import { LIMIT, YETKILER } from '/imports/environment/meta';
import { ETIKETLER  } from '/imports/environment/enums';
import debounce from '/imports/utils/debounce';
import { Etiketler, Kullanicilar } from '/imports/api/model';
import { cariKart, urun } from '/imports/api/methods';
import SimpleSchema from 'simpl-schema';

export const GelirGider = withTracker(props => {

  const subscriptionsReady = [
    Meteor.subscribe(props.subName, {selectorOptions: props.selectorOptions.get(), limit: props.limit.get()}),
  ].every(subscription => subscription.ready());

  let selector = {};
  let options = props.selectorOptions.get();
  Object.keys(options).forEach(o => (
      typeof options[o] === 'undefined' ||
      options[o] === ''
    ) && delete options[o]
  );

  if (Object.keys(options).length > 0) {
    selector.$and = [];

    if (options.etiketler && options.etiketler.length > 0) {
      selector.$and.push({
        etiketler : {
          $in: options.etiketler,
        }
      })
    }

    if (typeof options.iptal === 'boolean') {
      let compare = {};
      if (options.iptal) {
        compare.$eq = 0;
      } else {
        compare.$gt = 0;
      }
      selector.$and.push({ tutarX100: compare });
    }

    if (options.cariKart) {
      selector.$and.push({ cariKart: options.cariKart });
    }

    if (options.gerceklestiren) {
      selector.$and.push({ gerceklestiren: options.gerceklestiren });
    }

    if (options.urun) {
      selector.$and.push({ urun: options.urun });
    }

    if (options.dosyaNo) {
      selector.$and.push({ dosyaNo: options.dosyaNo });
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

  const cursor = props.collection.find(selector, {sort: {islemTarihi: -1, vadeTarihi: -1, createdAt: -1}, limit: props.limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    records: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

})(class GelirGider extends Component {

  constructor(props) {
    super(props);
    props.limit.set(LIMIT);
    props.selectorOptions.set({});
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
    this.props.limit.set(LIMIT);
    this.props.selectorOptions.set({});
    this.setState({searchPane: !this.state.searchPane});
  }

  search = (doc) => {
    this.props.selectorOptions.set({
      etiketler: doc.etiketler,
      iptal: doc.iptal,
      cariKart: doc.cariKart,
      gerceklestiren: doc.gerceklestiren,
      urun: doc.urun,
      dosyaNo: doc.dosyaNo,
      islemTarihiBegin: doc.islemTarihiBegin,
      islemTarihiEnd: doc.islemTarihiEnd,
    });
  }

  loadMore = (e) => {
    if (e) e.preventDefault();
    this.props.limit.set(this.props.limit.get() + LIMIT);
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
      <PageHeader title={this.props.title} toggleSearchPane={this.toggleSearchPane} modalOpen={this.modalOpen} dokumPath={this.props.dokumPath} />
      {
        this.state.searchPane &&
        <Row className="searchRow">
          <AutoForm
            validate="onChange"
            schema={new SimpleSchema({
              etiketler: {type: Array, optional: true},'etiketler.$':{type:String},
              iptal: {type: Boolean, optional: true},
              cariKart: {type: String, optional: true},
              gerceklestiren: {type: String, optional: true},
              urun: {type: String, optional: true},
              dosyaNo: {type: String, optional: true},
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
                <Col sm={6} className="searchContainer">
                  <SelectField
                    autofocus
                    label={false}
                    name="cariKart"
                    placeholder="Cari kart"
                    multi={false}
                    method={{name: cariKart.select}}
                  />
                </Col>
                <Col sm={6} className="searchContainer">
                  <SelectField
                    label={false}
                    name="urun"
                    placeholder="Ürün"
                    multi={false}
                    method={{
                      name: urun.select,
                      args: {
                        sadeceGelireUygunUrunler: this.props.sadeceGelireUygunUrunler,
                        sadeceGidereUygunUrunler: this.props.sadeceGidereUygunUrunler,
                      }
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="gerceklestiren"
                    placeholder="Gerçekleştiren"
                    multi={false}
                    options={Kullanicilar.selectOptions()}
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
              <Row>
                <Col sm={4} className="searchContainer">
                  <TextField
                    showInlineError
                    name="dosyaNo"
                    label={false}
                    placeholder="Dosya no"
                  />
                </Col>
                <Col sm={4} className="searchContainer">
                  <SelectField
                    label={false}
                    name="etiketler"
                    placeholder="Etiketler"
                    multi={true}
                    options={Etiketler.selectOptions(ETIKETLER.MUHASEBE.value)}
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
              <th>Cari kart</th>
              <th>Ürün</th>
              <th className="text-center">Adet</th>
              <th className="text-right">Döviz</th>
              <th className="text-right">Tutar</th>
              <th className="table-buttons"></th>
            </tr>
            </thead>
            <tbody>
            {
              records.length === 0
                ? (!subscriptionsLoading && <TableRowEmpty colSpan={7}/>)
                : records.map(record =>
                  <tr key={record._id}>
                    <td data-th="Tarih" className="noWrap">{record.islemTarihi.toFormattedDate()}</td>
                    <td data-th="Cari kart">{record.cariKartLabel()}</td>
                    <td data-th="Ürün">{record.urunLabel()}</td>
                    <td data-th="Adet" className="text-center">{record.adet === 0 ? '' : record.adet}</td>
                    <td data-th="Döviz" className="text-right noWrap">{record.tutarX100 === record.tutarX100TL ? '' : record.tutarLabel()}</td>
                    <td data-th="Tutar" className="text-right noWrap">{record.tutarX100TL === 0 ? 'iptal' : record.tutarLabelTL()}</td>
                    <TableRowButtons yetkiUpdate={YETKILER.MUHASEBE.value} modalOpen={this.modalOpen} record={record} />
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
        modal={this.props.modal}
        data={this.state.modal}
        close={this.modalClose} />
    </Container>;
  }

})
