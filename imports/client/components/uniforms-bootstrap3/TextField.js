import React        from 'react';
import classnames   from 'classnames';
import connectField from 'uniforms/connectField';
import {BaseField} from 'uniforms';

import wrapField from './wrapField';

import {StaticFieldInput} from '/imports/client/components/uniforms-custom';

const Text = ({staticField, ...props}) =>
  wrapField({feedbackable: true, ...props}, (
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
      name={props.name}
      onChange={event => props.onChange(event.target.value)}
      placeholder={props.placeholder}
      ref={props.inputRef}
      type={props.type}
      value={props.value}
    />
  ))
;

Text.defaultProps = {
  type: 'text'
};

Text.contextTypes = BaseField.contextTypes;

export default connectField(Text);
