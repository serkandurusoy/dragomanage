import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import {
  Alert,
  Glyphicon,
} from 'react-bootstrap';

const wasConnected = new ReactiveVar(false);
const retryTimeSeconds = new ReactiveVar(0);
const connectionRetryUpdateInterval = new ReactiveVar(null);

export default withTracker(props => {

  const isConnected = Meteor.status().connected;

  if(isConnected){
    Meteor.clearInterval(connectionRetryUpdateInterval.get());
    connectionRetryUpdateInterval.set(null);
    wasConnected.set(true);
    retryTimeSeconds.set(0);
  } else {
    if(wasConnected.get() === true){
      if(!connectionRetryUpdateInterval.get())
        connectionRetryUpdateInterval.set(Meteor.setInterval(() => {
          let retryIn = Math.round((Meteor.status().retryTime - (new Date()).getTime())/1000);
          if(isNaN(retryIn)) {
            retryIn = 0;
          }
          retryTimeSeconds.set(retryIn);
        },500));
    }
  }

  return {
    isConnected,
    wasConnected: wasConnected.get(),
    retryTimeSeconds: retryTimeSeconds.get(),
  }

  })(class ConnectionStatus extends Component {

    render() {
      const {
        isConnected,
        wasConnected,
        retryTimeSeconds,
      } = this.props;
      return wasConnected && !isConnected && (
          <Alert bsStyle="danger" onClick={e => {
            e.preventDefault();
            Meteor.reconnect()
          }}>
            <strong>Sunucu ile bağlantı koptu.</strong>
            <br/>
            Bağlantıyı tekrar denemek için kalan süre {retryTimeSeconds} saniye.
            Tekrar bağlanmayı denemek için tıklayın.
          </Alert>
        )
    }
  }
)
