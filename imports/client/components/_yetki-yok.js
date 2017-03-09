import React from 'react';
import { Alert } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';

export default function YetkiYok() {
  return <div className="yetkiWrapper">
    <div className="yetkiBox">
      <span className="fa-stack fa-3x">
        <FontAwesome
          name='circle'
          stack='2x'
        />
        <FontAwesome
          name='lock'
          stack='1x'
          inverse
        />
      </span>
      <h3>Yetki yok</h3>
      <Alert bsStyle="danger">Sistemde tanımlı işlem yetkiniz yok.</Alert>
    </div>
  </div>;
};
