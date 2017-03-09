import React from 'react';
import { Modal } from 'react-bootstrap';

export default function ModalHeader({title, staticForm, updateForm, referans}) {
  return <Modal.Header closeButton>
    <Modal.Title componentClass={'h5'}>
      {title} {staticForm ? 'detay' : updateForm ? 'düzenle' : 'ekle'} {(staticForm || updateForm) && <code className="referans-title">Referans: {referans}</code>}
    </Modal.Title>
  </Modal.Header>

}


