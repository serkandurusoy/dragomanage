import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';
import { Alert, Well } from 'react-bootstrap';
import { Image } from '/imports/client/components';
import { loginFailure } from '/imports/client/login-failure-handler';

export default createContainer(props => {

  return {
    loginFailure: loginFailure.get(),
  };

}, function Login({loginFailure, ...props}) {
  return <div className="loginWrapper">
    <div className="loginBox" onClick={login}>
      <div className="loginLogo">
        <Image src="/dragomanage-logo.svg" errorSrc="https://www.dragoman-turkey.com/wp-content/uploads/dynamik-gen/theme/images/dragoman-logo.png" responsive />
      </div>
      <Well>Google hesabı ile giriş yapmak için tıklayın.</Well>
      {
        loginFailure
        && loginFailure.error.reason !== 'You\'ve been logged out by the server. Please log in again.'
        && loginFailure.error.reason !== 'Your session has expired. Please log in again.'
        && loginFailure.error.reason !== 'No matching login attempt found'
        && <Alert bsStyle="danger">{loginFailure.error.reason}</Alert>
      }
    </div>
  </div>;
})

function login() {
  Meteor.loginWithGoogle({
    loginStyle: "redirect",
    requestPermissions: ['profile', 'email'],
    requestOfflineToken: true,
    loginUrlParameters: {
      prompt: 'select_account',
    },
  })
}
