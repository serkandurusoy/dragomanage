import React, { Component } from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import moment from 'moment-timezone';
import Alert from 'react-s-alert';
import download from 'downloadjs';

export default class PageHeader extends Component {

  downloader = (e) => {
    if (e) e.preventDefault();
    Alert.success('Döküm hazırlanıyor, lütfen bekleyin.');

    const fileName = `${this.props.dokumPath}-${moment().format('DD.MM.YYYY-HH.mm')}.xlsx`;
    const url = `/dokumler/${fileName}`;
    const showError = () => Alert.error('Bilinmeyen bir sorun oluştu, daha sonra tekrar deneyin.');

    const getDownload = new XMLHttpRequest();
    getDownload.open('GET', url, true);
    getDownload.responseType = 'blob';
    getDownload.onerror = (e) => showError();
    getDownload.onabort = (e) => showError();
    getDownload.onload = (e) => {
      if (e.target.status !== 200) {
        showError();
      } else {
        download(e.target.response, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }
    }

    getDownload.send();

  }

  render() {
    const {title, dokumPath, hideAddButton, toggleSearchPane, modalOpen} = this.props;

    return <Row className="firstRowOnPage">
      <Col xs={8}>
        <h5>{title}</h5>
      </Col>
      <Col xs={4} className="text-right">
        { dokumPath &&
        <Button bsSize="small" className="dokumGenerator" onClick={this.downloader} >
          <FontAwesome name='file-excel-o'/>
        </Button>
        }
        { dokumPath && ' ' }
        {
          toggleSearchPane &&
          <Button bsSize="small" onClick={toggleSearchPane}>
            <FontAwesome name='search'/>
          </Button>
        }
        { hideAddButton !== true && ' ' }
        {
          hideAddButton !== true
          && <Button bsStyle="success" bsSize="small" onClick={e => modalOpen(e, {}, 'insert')}>
            <FontAwesome name='plus'/>
          </Button>
        }
      </Col>
    </Row>
  }
}
