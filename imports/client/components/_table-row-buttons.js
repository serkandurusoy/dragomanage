import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data'
import { Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';

export default withTracker(props => {

  return {
    userId: Meteor.userId(),
    yetkili: Meteor.user().yetkili(props.yetkiUpdate),
    sadeceTalebeYetkili: Meteor.user().sadeceTalebeYetkili(),
    hicYetkiliDegil: Meteor.user().hicYetkiliDegil(),
  };

})(function TableRowButtons({record, modalOpen, yetkili, hicYetkiliDegil, sadeceTalebeYetkili, userId}) {
  return <td data-th="" className="table-buttons noWrap" >
    {
      yetkili &&
        <Button bsStyle="warning" bsSize="xsmall"
                onClick={e => modalOpen(e, record, 'update')} >
          <FontAwesome name='pencil' />
        </Button>
    }
    {yetkili && ' '}
    {
      !hicYetkiliDegil && !sadeceTalebeYetkili &&
      <Button bsStyle="primary" bsSize="xsmall" onClick={e => modalOpen(e, record, 'static')}>
        <FontAwesome name='info-circle' />
      </Button>
    }
    {
      !hicYetkiliDegil && sadeceTalebeYetkili && record.kaydeden === userId &&
      <Button bsStyle="primary" bsSize="xsmall" onClick={e => modalOpen(e, record, 'static')}>
        <FontAwesome name='info-circle' />
      </Button>
    }
  </td>
})
