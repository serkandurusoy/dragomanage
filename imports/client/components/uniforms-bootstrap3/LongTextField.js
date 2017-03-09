import React        from 'react';
import classnames   from 'classnames';
import connectField from 'uniforms/connectField';

import wrapField from './wrapField';

import { StaticFieldInput } from '/imports/client/components/uniforms-custom';

const LongText = ({staticField, ...props}) =>
    wrapField(props, (
      props.staticForm || staticField
        ? <StaticFieldInput
            className={props.className}
            content={props.content}
            notFoundText={props.notFoundText}
            value={props.value} />
        : <textarea
            className={classnames(props.inputClassName, 'form-control', {'form-control-danger': props.error})}
            disabled={props.disabled}
            id={props.id}
            name={props.name}
            onChange={event => props.onChange(event.target.value)}
            placeholder={props.placeholder}
            ref={props.inputRef}
            value={props.value}
          />
    ))
;

export default connectField(LongText);

