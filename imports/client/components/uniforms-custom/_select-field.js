import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import ReactSelect from 'react-select';
import 'react-select/dist/react-select.css';
import classNames from 'classnames';
import { connectField } from 'uniforms';
import wrapField from '/imports/client/components/uniforms-bootstrap3/wrapField';
import { StaticFieldInput } from '/imports/client/components/uniforms-custom';
import debounce from '/imports/utils/debounce';

export default connectField(function SelectField({staticField, ...props}) {
  return wrapField({feedbackable: true, ...props},
    props.staticForm || staticField
      ? <StaticFieldInput
          className={props.className}
          content={props.content}
          notFoundText={props.notFoundText}
          value={props.value} />
      : <Select {...props}/>
  )
});

class Select extends Component {

  state = {
    options: this.props.options || [],
    isLoading: false,
  }

  constructor(props) {
    super(props);
    this.inputChange = debounce(this.inputChange, 300)
  }

  inputChange = (input) => {
    if (this.props.method && input && input.toString().toTrimmed().length >= 3) {
      this.setState({
        isLoading: true
      });
      this.props.method.name.call({ keyword: input, ...this.props.method.args }, (error,result) => {
        if (error) {
          this.setState({
            isLoading: false,
          });
        } else {
          let options = this.state.options;
          result.forEach(r => {
            if (!options.find(o => o.value === r.value)) {
              options.push(r);
            }
          });
          options.sort((a,b) => a.label.localeCompare(b.label, 'tr'));
          this.setState({
            isLoading: false,
            options,
          });
        }
      });
    }
  }

  render() {

    const {props} = this;

    let options = this.state.options || [];
    let checkValues = [];
    if (Array.isArray(props.value)) {
      checkValues = props.value;
    } else if (!!props.value) {
      checkValues.push(props.value);
    }
    options = options.filter(o => !o.disabled || checkValues.includes(o.value))

    return <ReactSelect
      className={classNames('customSelect', props.className)}
      disabled={props.disabled}
      id={props.id}
      name={props.name}
      onChange={value => {
        if (!value) {
          props.onChange(null);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            props.onChange(null);
          } else {
            props.onChange(value.map(v => v.value));
          }
        } else {
          props.onChange(value.value);
        }
      }}
      ref={props.inputRef}
      value={props.value}
      multi={props.multi}
      options={options}
      loadOptions={props.loadOptions}
      isLoading={typeof props.isLoading === 'boolean' ? props.isLoading : this.state.isLoading}
      matchPos={props.matchPos}
      matchProp={props.matchProp}
      ignoreCase={props.ignoreCase}
      autoBlur={props.autoBlur}
      autoFocus={props.autoFocus}
      autoload={props.autoload}
      autosize={props.autosize === false ? false : true}
      backspaceRemoves={props.backspaceRemoves}
      clearable={props.clearable}
      resetValue={props.resetValue}
      deleteRemoves={props.deleteRemoves}
      inputProps={props.inputProps}
      joinValues={props.joinValues}
      labelKey={props.labelKey}
      onBlur={props.onBlur}
      onBlurResetsInput={props.onBlurResetsInput}
      onClose={props.onClose}
      onCloseResetsInput={props.onCloseResetsInput}
      onFocus={props.onFocus}
      onInputChange={props.method ? this.inputChange : props.onInputChange}
      onInputKeyDown={props.onInputKeyDown}
      openOnFocus={props.openOnFocus}
      searchable={props.searchable}
      placeholder={props.placeholder || 'Seçin veya arayın' }
      tabSelectsValue={props.tabSelectsValue}
      searchPromptText="Arama yapabilirsiniz"
      noResultsText="Kayıt bulunamadı"
      clearAllText="Temizle"
      clearValueText="Sil"
      backspaceToRemoveMessage=""
    />
  }

}
