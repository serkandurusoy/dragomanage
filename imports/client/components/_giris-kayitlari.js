import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import {
  Table,
  Button,
} from 'react-bootstrap';
import { TableRowLoading } from '/imports/client/components';
import { LIMIT } from '/imports/environment/meta';
import { GirisKayitlari as Collection } from '/imports/api/model';

const limit = new ReactiveVar(LIMIT);

const Tarihce = createContainer(props => {

  const subscriptionsReady = [
    Meteor.subscribe('userGirisKayitlari', {userId: props.userId, limit: limit.get()}),
  ].every(subscription => subscription.ready());

  const cursor = Collection.find({userId: props.userId}, {sort: {loginTime: -1}, limit: limit.get()});

  return {
    subscriptionsLoading: !subscriptionsReady,
    girisKayitlari: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };

}, class Tarihce extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    const { girisKayitlari } = nextProps;
    return girisKayitlari && girisKayitlari.length > 0;
  }

  loadMore = (e) => {
    if (e) e.preventDefault();
    limit.set(limit.get() + LIMIT);
  }

  render() {

    const {
      subscriptionsLoading,
      girisKayitlari,
      count,
    } = this.props;

    return <div>
      <Table className="customResponsive" striped hover>
        <thead>
        <tr>
          <th className="text-center">Giriş Zamanı</th>
          <th className="text-center">IP Adresi</th>
          <th className="text-center">Tarayıcı</th>
          <th className="text-center">Derleyici</th>
          <th className="text-center">Sistem</th>
          <th className="text-center">Cihaz</th>
        </tr>
        </thead>
        <tbody>
        {
          girisKayitlari.map(kayit =>
            <tr key={kayit._id}>
              <td data-th="Giriş Zamanı" className="text-center">{kayit.loginTime.toFormattedTime()}</td>
              <td data-th="IP Adresi" className="text-center">{kayit.xForwardedFor}</td>
              <td data-th="Tarayıcı" className="text-center">{kayit.userAgent && kayit.userAgent.browser && `${kayit.userAgent.browser.name} ${kayit.userAgent.browser.version}`}</td>
              <td data-th="Derleyici" className="text-center">{kayit.userAgent && kayit.userAgent.engine && `${kayit.userAgent.engine.name} ${kayit.userAgent.engine.version}`}</td>
              <td data-th="Sistem" className="text-center">{kayit.userAgent && kayit.userAgent.os && `${kayit.userAgent.os.name} ${kayit.userAgent.os.version}`}</td>
              <td data-th="Cihaz" className="text-center">{kayit.userAgent && kayit.userAgent.device && (kayit.userAgent.device.vendor || kayit.userAgent.device.model ? `${kayit.userAgent.device.vendor} ${kayit.userAgent.device.model}` : 'PC')}</td>
            </tr>
          )
        }
        {
          subscriptionsLoading && <TableRowLoading colSpan={6}/>
        }
        </tbody>
      </Table>
      <div className="text-center">
        {
          !subscriptionsLoading && count >= LIMIT &&
          <Button bsStyle="link" onClick={this.loadMore} style={{marginBottom: 20}}>
            <FontAwesome name='arrow-circle-down' size="lg" /> Daha fazla
          </Button>
        }
      </div>
    </div>
  }

})

export default class GirisKayitlari extends Component {

  constructor(props) {
    super(props);
    limit.set(LIMIT);
  }

  state = {
    panelOpen: false,
  }

  toggle = (e) => {
    e.preventDefault();
    this.setState({
      panelOpen : !this.state.panelOpen,
    });
    limit.set(LIMIT);
  }

  render() {
    return <div className="versions panel-group girisKayitlari">
      <div className="panel panel-default">
        <div className="panel-heading" onClick={this.toggle} >
          <div className="panel-title"><FontAwesome name='user-circle' /> Kullanıcının sisteme giriş kayıtları</div>
        </div>
        <div className={`panel-collapse collapse ${this.state.panelOpen ? 'in' : ''}`}>
          <div className="panel-body">
            <Tarihce userId={this.props.userId}/>
          </div>
        </div>
      </div>
    </div>
  }
}
