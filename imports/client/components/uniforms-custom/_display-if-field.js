import React, { Children } from 'react';
import { BaseField } from 'uniforms';

export default function DisplayIfField(
  {
    children,
    condition,
  },
  {
    uniforms: {
      model,
    },
  }
) {
  return condition(model) ? Children.only(children) : null;
}

DisplayIfField.contextTypes = BaseField.contextTypes;
