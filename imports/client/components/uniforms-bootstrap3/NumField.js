import React, {Component} from 'react';
import classnames   from 'classnames';
import connectField from 'uniforms/connectField';

import wrapField from './wrapField';

import {StaticFieldInput} from '/imports/client/components/uniforms-custom';

const noneIfNaN = x => isNaN(x) ? undefined : x;

const Num_ = ({staticField, ...props}) =>
  wrapField(props, (
    props.staticForm || staticField
      ? <StaticFieldInput
      className={props.className}
      content={props.content}
      notFoundText={props.notFoundText}
      value={props.value}/>
      : <input
      className={classnames(props.inputClassName, 'form-control', {'form-control-danger': props.error})}
      disabled={props.disabled}
      id={props.id}
      max={props.max}
      min={props.min}
      name={props.name}
      onChange={props.onChange}
      placeholder={props.placeholder}
      ref={props.inputRef}
      step={props.step || (props.decimal ? 0.01 : 1)}
      type="number"
      value={props.value}
    />
  ))
;

// TODO: Provide more generic solution.
class Num extends Component {
  constructor() {
    super(...arguments);

    this.state = {value: '' + this.props.value};

    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps({decimal, value}) {
    const parse = decimal ? parseFloat : parseInt;

    if (noneIfNaN(parse(value)) !== noneIfNaN(parse(this.state.value.replace(/[\.,]+$/, '')))) {
      this.setState({value: value === undefined || value === '' ? '' : '' + value});
    }
  }

  onChange({target: {value}}) {
    const change = value.replace(/[^\d\.,-]/g, '');
    const parsed = noneIfNaN((this.props.decimal ? parseFloat : parseInt)(change));

    this.setState(
      () => ({value: change}),
      () => this.props.onChange(parsed)
    );
  }

  render() {
    return Num_({...this.props, onChange: this.onChange, value: this.state.value});
  }
}

export default connectField(Num);
