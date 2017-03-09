import React, { Component } from 'react';
import classnames from 'classnames';
import connectField from 'uniforms/connectField';
import wrapField from '/imports/client/components/uniforms-bootstrap3/wrapField';
import { StaticFieldInput } from './';

const Number = ({staticField, ...props}) =>
  wrapField({feedbackable: true, ...props}, (
    props.staticForm || staticField
      ? <StaticFieldInput
          className={props.className}
          content={props.content}
          notFoundText={props.notFoundText}
          value={props.value} />
      : <input
          className={classnames(props.inputClassName, 'form-control', {'form-control-danger': props.error})}
          disabled={props.disabled}
          id={props.id}
          name={props.name}
          onChange={event => props.onChange(event.target.value.replace(/\D+/g, ''))}
          placeholder={props.placeholder}
          ref={props.inputRef}
          type={props.type}
          value={props.value}
        />
  ))
;

Number.defaultProps = {
  type: 'text'
};

export default connectField(Number);
