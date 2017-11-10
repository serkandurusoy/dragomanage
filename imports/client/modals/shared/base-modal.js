import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { Loading, Versions, ModalHeader, ModalFooter, GirisKayitlari } from '/imports/client/components';
import { formHandlers } from '/imports/utils/client/form-handlers';

export default withTracker(props => {

  let record;
  let versions;

  const subscriptionsReady = props.operation === 'insert' || [
      Meteor.subscribe(props.subscription, {_id: props.record._id}),
    ].every(subscription => subscription.ready());

  if (props.operation !== 'insert' && props.record) {
    record = props.collection.findOne(props.record._id);
    versions = record && record.versions().fetch()
  }

  return {
    subscriptionsLoading: !subscriptionsReady,
    record,
    versions,
  };

})(class BaseModal extends Component {

  state = { errors: null }

  formRef = null

  setFormRef = (ref) => {
    this.formRef = ref;
  }

  schema = this.props.schema || this.props.collection.Schema

  close = (e) => {
    formHandlers.close.call(this, e);
  }

  submit = (e) => {
    formHandlers.submit.call(this, e);
  }

  onSubmit = (doc) => {
    formHandlers.onSubmit.call(this, doc, this.props.formMethod);
  }

  onSubmitCallback = (err, res) => {
    formHandlers.onSubmitCallback.call(this, err, res);
  }

  onChange = (key,value) => {
    formHandlers.onChange.call(this, key, value);
  }

  render() {
    const {
      subscriptionsLoading,
      show,
      size,
      record,
      versions,
      operation,
      title,
      kart,
    } = this.props;

    const insertForm = operation === 'insert';
    const updateForm = operation === 'update';
    const staticForm = operation === 'static';

    return ( ( (staticForm || updateForm) && record) || insertForm ) && <Modal
        show={show}
        onHide={this.close}
        bsSize={size || null}
        backdrop="static"
        keyboard={false} >
        <ModalHeader title={title} staticForm={staticForm} updateForm={updateForm} referans={!insertForm && record._id}/>
        <Modal.Body>
          {
            subscriptionsLoading
              ? <Loading/>
              : <div>
                {
                  React.createElement(
                    kart,
                    {
                      staticForm,
                      updateForm,
                      setFormRef: this.setFormRef,
                      schema: this.schema,
                      record,
                      onSubmit: this.onSubmit,
                      onChange: this.onChange,
                      error: this.state.errors,
                      sadeceGelireUygunUrunler: this.props.sadeceGelireUygunUrunler,
                      sadeceGidereUygunUrunler: this.props.sadeceGidereUygunUrunler,
                      sadeceSatilabilirUrunler: this.props.sadeceSatilabilirUrunler,
                      sadeceStokTakipliUrunler: this.props.sadeceStokTakipliUrunler,
                    }
                  )
                }
                {
                  staticForm && record && record.user && record.user() && <GirisKayitlari userId={record.user()._id} />
                }
                {
                  staticForm && <Versions
                    record={record}
                    component={kart}
                    versions={versions}
                    schema={this.schema}
                  />
                }
              </div>
          }
        </Modal.Body>
        <ModalFooter submit={this.submit} close={this.close} staticForm={staticForm} updateForm={updateForm}/>
      </Modal>
  }

})
