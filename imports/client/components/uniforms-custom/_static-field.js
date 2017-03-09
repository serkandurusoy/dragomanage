import React from 'react';
import {
  FormControl,
} from 'react-bootstrap';
import { connectField } from 'uniforms';
import wrapField from '/imports/client/components/uniforms-bootstrap3/wrapField';

export default connectField(function StaticField(props) {
  return wrapField({feedbackable: true, ...props},
    <StaticFieldInput {...props}/>
  );
});

export function StaticFieldInput({content, notFoundText, className, value}) {

  let text;

  if (['string', 'number'].includes(typeof value)) {
    text = value.toString();
  }

  if (content) {
    text = content.toString();
  }

  if (!text || text && text.toTrimmed().length === 0) {
    text = notFoundText || '---';
  }

  return <FormControl.Static className={className}>
    {text}
  </FormControl.Static>

}
