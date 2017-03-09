import React from 'react';
import { LIMIT } from '/imports/environment/meta';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { NoOp } from './';

export default function PageFooter({
  subscriptionsLoading,
  count,
  loadMore,
  modal,
  data,
  close,
}) {
  return <div>
    <Row>
      <Col xs={12} className="text-center">
        {
          !subscriptionsLoading && count >= LIMIT &&
          <Button bsStyle="link" onClick={loadMore} style={{marginBottom: 20}}>
            <FontAwesome name='arrow-circle-down' size="lg" /> Daha fazla
          </Button>
        }
      </Col>
    </Row>
    {
      data &&
        React.createElement(
          modal || NoOp,
          {
            size: 'large',
            record: data.record,
            operation: data.operation,
            show: !!data,
            close: close,
          }
        )
    }
  </div>
}
