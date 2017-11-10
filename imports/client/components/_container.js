import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import {
  Row,
  Col,
} from 'react-bootstrap';
import {  NotAllowed } from '/imports/client/pages';

export default withTracker(props => {

  return {
    yetkili: Meteor.user().yetkili(props.yetki),
  };

})(function Container({ yetkili, children }) {
  return !yetkili ? <NotAllowed /> : (
    <Row>
      <Col xs={12}>
        <div className="contentContainer">
          { children }
        </div>
      </Col>
    </Row>
  );
})
