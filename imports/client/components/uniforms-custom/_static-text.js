import React from 'react';
import {
  ControlLabel,
  FormGroup,
  FormControl,
} from 'react-bootstrap';

export default function StaticText({schema, model, name, content, notFoundText, className}) {

  let text;

  if (model && name) {
    const value = name.split('.').reduce((acc, key) => acc[key], model);
    if (['string', 'number'].includes(typeof value)) {
      text = value.toString();
    }
  }

  if (content) {
    text = content.toString();
  }

  if (!text || text && text.toTrimmed().length === 0) {
    text = notFoundText || '---';
  }

  return <FormGroup className={className}>
    <ControlLabel >
      {schema.label(name)}
    </ControlLabel>
    <FormControl.Static>
      {text}
    </FormControl.Static>
  </FormGroup>

}
