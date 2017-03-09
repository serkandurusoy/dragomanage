import React        from 'react';
import classnames   from 'classnames';
import connectField from 'uniforms/connectField';

import wrapField from './wrapField';

import { StaticFieldInput } from '/imports/client/components/uniforms-custom';

const Bool = ({staticField, ...props}) =>
    wrapField(props, (
      props.staticForm || staticField
        ? <StaticFieldInput
            className={props.className}
            content={props.content}
            notFoundText={props.notFoundText}
            value={props.value} />
        : <div className={classnames(props.inputClassName, `checkbox${props.inline ? '-inline' : ''}`)}>
            <label htmlFor={props.id}>
              <input
                checked={props.value}
                disabled={props.disabled}
                id={props.id}
                name={props.name}
                onChange={() => props.onChange(!props.value)}
                ref={props.inputRef}
                type="checkbox" />
              {props.transform ? props.transform(props.value) : props.value.toString()}
          </label>
          </div>
    ))
;

export default connectField(Bool);

