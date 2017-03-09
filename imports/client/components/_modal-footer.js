import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function ModalFooter({close, submit, staticForm, updateForm}) {
  return <Modal.Footer>
    <Button onClick={close}>{staticForm ? 'Kapat' : 'Vazgeç'}</Button>
    {
      !staticForm &&
      <Button onClick={submit} bsStyle={updateForm ? 'warning' : 'success'}>{updateForm ? 'Değiştir' : 'Ekle'}</Button>
    }
  </Modal.Footer>

}


