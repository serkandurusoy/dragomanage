import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { withTracker } from 'meteor/react-meteor-data';
import React, {Component} from 'react';
import {
  Grid,
  Row,
  Col,
} from 'react-bootstrap';
import {
  Navigation,
  ConnectionStatus,
  Loading,
  Login,
  YetkiYok,
} from '/imports/client/components';

export default withTracker(() => {

  let currentUser = Meteor.user();
  let yetkiVar = false;

  const subscriptionsReady = [
    Meteor.subscribe('currentUser'),
    Meteor.subscribe('kullanicilar'),
    Meteor.subscribe('kurlar'),
    Meteor.subscribe('bakiyeler'),
    Meteor.subscribe('etiketler'),
    Meteor.subscribe('siniflar'),
    Meteor.subscribe('markalar'),
    Meteor.subscribe('kasalar'),
    Meteor.subscribe('konumlar'),
  ].every(subscription => subscription.ready());

  if (currentUser && subscriptionsReady) {
    const kullanici = currentUser.kullanici();
    if (kullanici) {
      yetkiVar = kullanici.aktif
        && (
          kullanici.adminVeyaPatron()
          || (
            kullanici.yetkiler
            && kullanici.yetkiler.length !== 0
          )
        )
    }
  }

  return {
    currentUser,
    loggingIn: Meteor.loggingIn(),
    accountsConfigured: Accounts.loginServicesConfigured(),
    subscriptionsLoading: !subscriptionsReady,
    yetkiVar,
  };

})(class Layout extends Component {

  componentWillMount(){
    this.props.clearAlerts();
  }

  render(){
    const {
      currentUser,
      loggingIn,
      accountsConfigured,
      subscriptionsLoading,
      yetkiVar,
      children,
    } = this.props;

    return currentUser ? (
      subscriptionsLoading
        ? <Loading/>
        : !yetkiVar
        ? <YetkiYok/>
        : <div>
          <Navigation/>
          <Grid fluid>
            <Row>
              <Col xs={12} className="connectionStatus">
                <ConnectionStatus />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Row>
                  <Col xs={12} className="mainContent">
                    <div className="content">
                      {children}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Grid>
        </div>
    ) : loggingIn
      ? <Loading />
      : accountsConfigured
        ? <Login />
        : <Loading />;
  }

})




/*(function Layout({
                   currentUser,
                   loggingIn,
                   accountsConfigured,
                   subscriptionsLoading,
                   yetkiVar,
                   children,
                 }) {
  return currentUser ? (
    subscriptionsLoading
      ? <Loading/>
      : !yetkiVar
      ? <YetkiYok/>
      : <div>
        <Navigation/>
        <Grid fluid>
          <Row>
            <Col xs={12} className="connectionStatus">
              <ConnectionStatus />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Row>
                <Col xs={12} className="mainContent">
                  <div className="content">
                    {children}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Grid>
      </div>
  ) : loggingIn
    ? <Loading />
    : accountsConfigured
      ? <Login />
      : <Loading />;
})*/
