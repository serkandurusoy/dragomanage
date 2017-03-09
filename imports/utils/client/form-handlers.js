import Alert from 'react-s-alert';
import { ValidationError } from 'meteor/mdg:validation-error';

export const formHandlers = {

  close(e) {
    if (e) e.preventDefault();
    this.setState({errors: null});
    this.formRef.reset();
    this.props.close();
  },

  submit(e) {
    e.preventDefault();
    this.formRef.submit();
  },

  onSubmit(doc, formMethod) {
    const insertForm = this.props.operation === 'insert';
    const updateForm = this.props.operation === 'update';
    if (insertForm || updateForm) {
      let _id;
      if (updateForm) {
        _id = doc._id || this.props.record._id;
      }
      this.schema.clean(doc);
      if (_id) {
        doc._id = _id;
      }
      ( insertForm ? formMethod.insert : formMethod.update )
        .call(
          (
            insertForm
              ? doc
              : {_id, doc}
          ),
          this.onSubmitCallback
        );
    }
  },

  onSubmitCallback(err, res) {
    if (err) {
      if (ValidationError.is(err)) {
        const {
          errors
        } = this.state;
        if (errors) {
          this.setState({
            errors: new ValidationError(errors.details.concat(err.details))
          });
        } else {
          this.setState({
            errors: err
          });
        }
      } else {
        Alert.error(err.message);
      }
    } else {
      Alert.success('İşlem gerçekleşti')
      this.close();
    }
  },

  onChange(key,value) {
    const {
      errors
    } = this.state;
    if (errors && errors.details.find(e => e.name === key && e.value !== value)) {
      if (errors.details.length === 1) {
        this.setState({errors: null})
      } else {
        this.setState({
          errors: new ValidationError(errors.details.filter(e => e.name !== key))
        })
      }
    }
  },

};
